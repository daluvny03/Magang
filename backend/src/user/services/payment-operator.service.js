import { recoveryPool } from '../../config/payment-recovery-database.js'
import { validateDokuConfig } from '../utils/doku-config.js'
import { validateCheckoutAccount } from '../utils/doku-checkout-request.js'
import { checkDokuPaymentStatus } from '../clients/doku-status.client.js'
import { verifyDokuPaymentStatus } from '../validators/doku-payment-status.validator.js'
import { parseDokuTransactionDate } from '../validators/doku-payment-evidence.validator.js'

const operatorError = (code) => Object.assign(new Error(code), { code })

export const inspectRecoveryPayment = async (paymentId, db = recoveryPool) => {
  const { rows } = await db.query('SELECT * FROM payments WHERE id = $1', [paymentId])
  const payment = rows[0]
  if (!payment) throw operatorError('PAYMENT_NOT_FOUND')
  // Jangan keluarkan URL checkout, credential, atau payload pelanggan ke terminal.
  return {
    id: String(payment.id),
    invoiceNumber: payment.invoice_number,
    requestId: payment.doku_request_id,
    amount: String(payment.amount),
    currency: payment.currency,
    status: payment.status,
    paidAt: payment.paid_at,
    appliedAt: payment.applied_at,
    hasCheckoutUrl: Boolean(payment.payment_url),
    hasSnapshot: Boolean(payment.checkout_request_body),
    reconciliationAttempts: payment.reconciliation_attempt_count,
    nextReconciliationAt: payment.next_reconciliation_at,
    resolution: payment.recovery_resolution ?? null,
  }
}

const validateConfirmation = (payment, evidence, config) => {
  const textFields = ['operator', 'reason', 'providerReference']
  if (!evidence || textFields.some((key) =>
    typeof evidence[key] !== 'string' || !evidence[key].trim() || evidence[key].length > 1000
  )) throw operatorError('OPERATOR_EVIDENCE_REQUIRED')

  let confirmedAt
  try {
    confirmedAt = Date.parse(parseDokuTransactionDate(evidence.confirmedAt))
  } catch {
    throw operatorError('OPERATOR_EVIDENCE_MISMATCH')
  }
  const age = Date.now() - confirmedAt
  if (
    !Number.isFinite(confirmedAt) || confirmedAt < new Date(payment.created_at).getTime() ||
    age < 0 || age > 24 * 60 * 60 * 1000 ||
    evidence.invoiceNumber !== payment.invoice_number ||
    evidence.requestId !== payment.doku_request_id ||
    !['number', 'string'].includes(typeof evidence.amount) ||
    Number(evidence.amount) !== Number(payment.amount) ||
    evidence.currency !== payment.currency ||
    evidence.environment !== config.environment ||
    evidence.clientId !== config.clientId ||
    evidence.confirmedUnpaid !== true || evidence.confirmedNotPayable !== true ||
    !['not_created', 'closed_unpaid'].includes(evidence.providerOutcome)
  ) throw operatorError('OPERATOR_EVIDENCE_MISMATCH')

  if (payment.checkout_request_body) {
    validateCheckoutAccount(payment.checkout_request_body, config)
  }

  // Bukti adalah pernyataan operator berdasarkan konfirmasi provider. Aplikasi
  // tidak menganggap file JSON sebagai bukti kriptografis pembayaran/nonpayment.
  return {
    operator: evidence.operator.trim(),
    reason: evidence.reason.trim(),
    providerReference: evidence.providerReference.trim(),
    providerOutcome: evidence.providerOutcome,
    confirmedAt: new Date(confirmedAt).toISOString(),
    confirmedUnpaid: true,
    confirmedNotPayable: true,
    invoiceNumber: evidence.invoiceNumber,
    requestId: evidence.requestId,
    amount: String(payment.amount),
    currency: payment.currency,
    environment: config.environment,
    clientId: config.clientId,
  }
}

export const closeUnpaidRecoveryPayment = async ({
  paymentId, evidence, confirmedInvoice, maintenanceConfirmed, db = recoveryPool,
}) => {
  if (!maintenanceConfirmed) throw operatorError('MAINTENANCE_CONFIRMATION_REQUIRED')
  const { rows } = await db.query('SELECT * FROM payments WHERE id = $1', [paymentId])
  const initial = rows[0]
  if (!initial) throw operatorError('PAYMENT_NOT_FOUND')
  if (!Object.hasOwn(initial, 'recovery_resolution')) {
    throw operatorError('RECOVERY_RESOLUTION_SCHEMA_REQUIRED')
  }
  if (confirmedInvoice !== initial.invoice_number) throw operatorError('INVOICE_CONFIRMATION_REQUIRED')
  const config = validateDokuConfig()
  const confirmation = validateConfirmation(initial, evidence, config)
  if (!['initiating', 'pending', 'reconciling'].includes(initial.status) ||
      initial.paid_at || initial.applied_at || initial.recovery_resolution) {
    throw operatorError('PAYMENT_NOT_OPEN_UNPAID')
  }

  // Inquiry di luar transaksi. FAILED sebuah metode, timeout, dan 409 tidak
  // membuktikan order tertutup. 404 hanya diterima bersama konfirmasi provider
  // bahwa invoice/request ini tidak pernah dibuat dan tidak bisa dibayar.
  let inquiryOutcome
  try {
    const response = await checkDokuPaymentStatus({ invoiceNumber: initial.invoice_number })
    const verified = verifyDokuPaymentStatus(initial, response)
    if (verified.isPaid) throw operatorError('PAYMENT_VERIFIED_PAID_USE_RECONCILE')
    if (!verified.isOrderExpired || confirmation.providerOutcome !== 'closed_unpaid') {
      throw operatorError('DOKU_ORDER_NOT_CONFIRMED_CLOSED')
    }
    inquiryOutcome = 'ORDER_EXPIRED'
  } catch (error) {
    if (error.code !== 'DOKU_STATUS_CHECK_FAILED' || error.httpStatus !== 404 ||
        confirmation.providerOutcome !== 'not_created') throw error
    inquiryOutcome = 'NOT_FOUND_WITH_PROVIDER_CONFIRMATION'
  }

  const client = await db.connect()
  let failed = false
  try {
    await client.query('BEGIN')
    await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [initial.user_id])
    const locked = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [paymentId])
    const payment = locked.rows[0]
    if (!payment || String(payment.user_id) !== String(initial.user_id)) {
      throw operatorError('PAYMENT_CHANGED_DURING_RESOLUTION')
    }
    validateConfirmation(payment, evidence, config)

    const successEvents = await client.query(
      `SELECT id FROM payment_webhook_events
       WHERE payment_id = $1 AND provider = 'doku' AND transaction_status = 'SUCCESS'
       LIMIT 1`, [paymentId]
    )
    if (successEvents.rowCount) throw operatorError('SUCCESS_EVENT_EXISTS_RECOVER_WEBHOOK_FIRST')

    const resolution = {
      action: 'close_unpaid',
      previousStatus: payment.status,
      resolvedAt: new Date().toISOString(),
      inquiryOutcome,
      confirmation,
    }
    const updated = await client.query(
      `UPDATE payments
       SET status = 'cancelled', recovery_resolution = $2::jsonb,
           next_reconciliation_at = NULL, updated_at = NOW()
       WHERE id = $1 AND status IN ('initiating', 'pending', 'reconciling')
         AND paid_at IS NULL AND applied_at IS NULL
         AND recovery_resolution IS NULL
         AND updated_at <= NOW() - INTERVAL '60 seconds'
       RETURNING id`, [paymentId, JSON.stringify(resolution)]
    )
    if (updated.rowCount !== 1) throw operatorError('PAYMENT_CHANGED_OR_RECENTLY_CLAIMED')
    await client.query('COMMIT')
    return { paymentId, status: 'cancelled', action: 'close_unpaid' }
  } catch (error) {
    failed = true
    try { await client.query('ROLLBACK') } catch { /* Koneksi dibuang. */ }
    throw error
  } finally {
    client.release(failed)
  }
}
