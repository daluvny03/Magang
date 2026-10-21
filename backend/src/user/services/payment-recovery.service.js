
import { recoveryPool } from '../../config/payment-recovery-database.js'

import {
  checkDokuPaymentStatus,
} from '../clients/doku-status.client.js'

import {
  verifyDokuPaymentStatus,
} from '../validators/doku-payment-status.validator.js'

import {
  markPaymentPaid,
  saveDokuTransactionId,
  scheduleNextPaymentReconciliation,
  claimCheckoutRecovery,
  saveDokuCheckoutResult,
  markPaymentOrderExpired,
} from '../repositories/payment.repository.js'
import { createDokuCheckout } from '../clients/doku-checkout-client.js'
import { parseDokuExpiredDate } from '../utils/doku-date.js'
import { validateDokuConfig } from '../utils/doku-config.js'
import { validateCheckoutAccount, validateCheckoutSnapshot } from '../utils/doku-checkout-request.js'

import {
  findPaymentsForReconciliation,
  findUnappliedPaidPayments,
} from '../repositories/payment.repository.js'

import {
  applyVerifiedPremiumPayment,
} from './subscription-lifecycle.service.js'

import {
  findRecoverableWebhookEvents,
} from '../repositories/payment-webhook.repository.js'

import {
  processRecordedDokuEvent,
} from './payment-webhook.service.js'


export const getPaymentRecoveryCandidates = async (db = recoveryPool) => {
  const [
    reconciliationPayments,
    unappliedPayments,
  ] = await Promise.all([
    findPaymentsForReconciliation(20, db),
    findUnappliedPaidPayments(20, db),
  ])

  return {
    reconciliationPayments,
    unappliedPayments,
  }
}

export const recoverUnappliedPremiumPayments = async (db = recoveryPool) => {
  const payments = await findUnappliedPaidPayments(20, db)

  const results = []

  for (const payment of payments) {
    try {
      const result = await applyVerifiedPremiumPayment(
        payment.id,
        db
      )

      results.push({
        paymentId: payment.id,
        status: 'recovered',
        action: result.action,
      })
    } catch (error) {
      try {
        await scheduleNextPaymentReconciliation(payment.id, db)
      } catch (retryError) {
        console.error('Premium recovery retry scheduling failed:', {
          paymentId: payment.id,
          code: retryError.code ?? 'RETRY_SCHEDULING_FAILED',
        })
      }
      console.error('Premium recovery failed:', {
        paymentId: payment.id,
        code: error.code ?? 'RECOVERY_FAILED',
      })

      results.push({
        paymentId: payment.id,
        status: 'failed',
      })
    }
  }

  return results
}

export const recoverPendingWebhookEvents = async (db = recoveryPool) => {
  const events = await findRecoverableWebhookEvents(20, db)
  const results = []

  for (const event of events) {
    try {
      const result = await processRecordedDokuEvent(
        event.id,
        db
      )

      results.push({
        eventId: event.id,
        status: result.status,
      })
    } catch (error) {
      console.error('Webhook recovery failed:', {
        eventId: event.id,
        code: error.code ?? 'WEBHOOK_RECOVERY_FAILED',
      })

      results.push({
        eventId: event.id,
        status: 'failed',
      })
    }
  }

  return results
}

export const reconcileDokuPayment = async (
  paymentId,
  { db = recoveryPool, allowReplay = true, includeClosed = false } = {}
) => {
  const initialResult = await db.query(
    `
      SELECT *
      FROM payments
      WHERE id = $1
    `,
    [paymentId]
  )

  const initialPayment = initialResult.rows[0]

  const eligibleStatuses = ['initiating', 'pending', 'reconciling']
  if (includeClosed && !allowReplay) eligibleStatuses.push('expired', 'cancelled')
  if (
    !initialPayment ||
    !eligibleStatuses.includes(
      initialPayment.status
    )
  ) {
    return { status: 'skipped', paymentId }
  }

  // Identitas account wajib cocok, tetapi kerusakan body replay tidak boleh
  // menghalangi inquiry ke account yang sudah teridentifikasi.
  const config = validateDokuConfig()
  if (initialPayment.checkout_request_body) {
    validateCheckoutAccount(initialPayment.checkout_request_body, config)
  }

  let dokuResponse
  let verification
  let inquiryError
  try {
    dokuResponse = await checkDokuPaymentStatus({
      invoiceNumber: initialPayment.invoice_number,
    })
    verification = verifyDokuPaymentStatus(initialPayment, dokuResponse)
  } catch (error) {
    inquiryError = error
  }

  // Inquiry selalu lebih dahulu, termasuk pending tanpa URL dan claim gagal.
  // Jangan replay transaksi yang sudah terbukti paid atau order expired.
  if (allowReplay && !initialPayment.payment_url &&
      !verification?.isPaid && !verification?.isOrderExpired) {
    if (!initialPayment.checkout_request_body) {
      // Transaksi legacy masih diperiksa statusnya, tetapi payload tidak ditebak.
      console.warn('Legacy checkout requires operator review; replay skipped:', {
        paymentId,
        code: 'CHECKOUT_SNAPSHOT_MISSING',
      })
    } else {
      try {
        validateCheckoutSnapshot(initialPayment.checkout_request_body, initialPayment, config)
        const claimed = await claimCheckoutRecovery(paymentId, db)
        if (claimed) {
          const checkout = await createDokuCheckout({
            invoiceNumber: claimed.invoice_number,
            amount: claimed.amount,
            requestId: claimed.doku_request_id,
            snapshot: claimed.checkout_request_body,
          })
          await saveDokuCheckoutResult({
            paymentId,
            paymentUrl: checkout.paymentUrl,
            expiredAt: parseDokuExpiredDate(checkout.expiredDate),
          }, db)
        }
      } catch (error) {
        // Kegagalan replay tidak menghilangkan hasil inquiry.
        console.error('Checkout replay unresolved:', {
          paymentId,
          code: error.code ?? 'CHECKOUT_REPLAY_FAILED',
          httpStatus: error.httpStatus,
        })
      }
    }
  }

  if (inquiryError) throw inquiryError

  if (!verification.isPaid && !verification.isOrderExpired) {
    return {
      status: 'awaiting_payment',
      paymentId,
      dokuStatus: verification.status,
    }
  }

  const client = await db.connect()
  let transactionFailed = false

  try {
    await client.query('BEGIN')

    // Lock user terlebih dahulu sesuai lifecycle 7B.4.
    const userResult = await client.query(
      'SELECT user_id FROM payments WHERE id = $1',
      [paymentId]
    )

    const userId = userResult.rows[0]?.user_id

    if (!userId) {
      throw new Error('Payment owner not found')
    }

    await client.query(
      'SELECT id FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    )

    const paymentResult = await client.query(
      'SELECT * FROM payments WHERE id = $1 FOR UPDATE',
      [paymentId]
    )

    const payment = paymentResult.rows[0]

    if (!payment) {
      throw new Error('Payment not found')
    }

    // Validasi ulang setelah mendapatkan row lock.
    const lockedVerification = verifyDokuPaymentStatus(payment, dokuResponse)

    if (lockedVerification.isOrderExpired) {
      const expired = await markPaymentOrderExpired(paymentId, client)
      await client.query('COMMIT')
      return { status: expired ? 'expired' : 'skipped', paymentId }
    }

    await saveDokuTransactionId(paymentId, lockedVerification.transactionId, client)

    if (
      payment.status === 'paid' &&
      payment.paid_at
    ) {
      await client.query('COMMIT')
    } else if (
      // SUCCESS yang sudah diverifikasi tetap dihormati bila order ditutup
      // setelah inquiry dimulai; guarded update tetap menolak double paid.
      ['initiating', 'pending', 'reconciling', 'expired', 'cancelled'].includes(payment.status)
    ) {
      const updated = await markPaymentPaid(
        paymentId,
        lockedVerification.paidAt,
        client
      )

      if (!updated) {
        throw new Error('Payment status update failed')
      }

      await client.query('COMMIT')
    } else {
      await client.query('ROLLBACK')

      return {
        status: 'skipped',
        paymentId,
      }
    }
  } catch (error) {
    transactionFailed = true
    try { await client.query('ROLLBACK') } catch { /* Buang koneksi di finally. */ }
    throw error
  } finally {
    client.release(transactionFailed)
  }

  const application = await applyVerifiedPremiumPayment(
    paymentId,
    db
  )

  return {
    status: 'recovered',
    paymentId,
    application,
  }
}
