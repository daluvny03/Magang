
import {
  findPaymentByInvoice,
  findWebhookEventByRequestId,
  saveWebhookEvent,
  isSameWebhookPayload,
  markWebhookProcessingFailed,
} from '../repositories/payment-webhook.repository.js'
import { pool } from '../../config/database.js'

import { markPaymentPaid, saveDokuTransactionId } from
  '../repositories/payment.repository.js'
import { verifyDokuPaymentIdentity, parseDokuTransactionDate } from '../validators/doku-payment-evidence.validator.js'
import { extractDokuTransactionId } from '../utils/doku-transaction-identifier.js'

import { applyVerifiedPremiumPayment } from
  './subscription-lifecycle.service.js'


export const recordDokuWebhook = async ({
  requestId,
  payload,
}) => {
  const invoiceNumber = payload.order.invoice_number
  const transactionStatus = payload.transaction.status
  const payment = await findPaymentByInvoice(invoiceNumber)

  if (!payment) {
    return { status: 'payment_not_found' }
  }

  // ACK event yang sudah selesai tetap kompatibel dengan data sebelum patch.
  // Signature telah diverifikasi controller dan seluruh payload harus identik.
  const previous = await findWebhookEventByRequestId(requestId)
  if (previous?.processing_status === 'processed') {
    const matches = await isSameWebhookPayload({
      requestId,
      paymentId: payment.id,
      invoiceNumber,
      transactionStatus,
      payload,
    })
    return matches
      ? { status: 'duplicate', eventId: previous.id, processingStatus: 'processed' }
      : { status: 'event_conflict' }
  }

  try {
    verifyDokuPaymentIdentity(payment, payload)
  } catch {
    return { status: 'payment_mismatch' }
  }

  const inserted = await saveWebhookEvent({
    paymentId: payment.id,
    requestId,
    invoiceNumber,
    transactionStatus,
    payload,
  })

  if (inserted) {
    return {
      status: 'recorded',
      eventId: inserted.id,
    }
  }

  const existing = await findWebhookEventByRequestId(
    requestId
  )

  if (!existing) {
    throw new Error('Webhook event lookup failed')
  }

  const matches = await isSameWebhookPayload({
    requestId,
    paymentId: payment.id,
    invoiceNumber,
    transactionStatus,
    payload,
  })

  if (!matches) {
    return { status: 'event_conflict' }
  }

  return {
    status: 'duplicate',
    eventId: existing.id,
    processingStatus: existing.processing_status,
  }
}

export const processRecordedDokuEvent = async (eventId) => {
  try {
    return await processDokuEvent(eventId)
  } catch (error) {
    // Semua caller memakai pencatatan yang sama. Transaksi processing sudah
    // di-rollback dan koneksinya dilepas sebelum kegagalan disimpan.
    try {
      await markWebhookProcessingFailed(eventId)
    } catch (recordError) {
      // Jangan mengganti error processing asli atau mencatat payload/secret.
      console.error('Webhook failure persistence failed:', {
        eventId,
        code: recordError.code ?? 'WEBHOOK_FAILURE_PERSISTENCE_FAILED',
      })
    }
    throw error
  }
}

const processDokuEvent = async (eventId) => {
  const client = await pool.connect()

  let event
  let paymentId = null

  try {
    await client.query('BEGIN')

    const eventResult = await client.query(
      `
        SELECT *
        FROM payment_webhook_events
        WHERE id = $1
          AND provider = 'doku'
      `,
      [eventId]
    )

    event = eventResult.rows[0]

    if (!event || !event.payment_id) {
      throw new Error('Webhook event not found')
    }

    paymentId = event.payment_id

    // Samakan urutan lock dengan subscription lifecycle:
    // users -> payments -> webhook events.
    const paymentOwnerResult = await client.query(
      `SELECT user_id FROM payments WHERE id = $1`,
      [paymentId]
    )

    const userId = paymentOwnerResult.rows[0]?.user_id

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

    const lockedEventResult = await client.query(
      `
        SELECT *
        FROM payment_webhook_events
        WHERE id = $1
        FOR UPDATE
      `,
      [eventId]
    )

    event = lockedEventResult.rows[0]

    if (
      !payment ||
      !event ||
      String(event.payment_id) !== String(payment.id)
    ) {
      throw new Error('Webhook payment mismatch')
    }

    if (event.processing_status === 'processed') {
      await client.query('COMMIT')

      return {
        status: 'already_processed',
        paymentId,
      }
    }

    // Validasi ulang terhadap row payment yang telah dikunci.
    const payload = event.payload
    if (
      event.invoice_number !== payment.invoice_number ||
      event.transaction_status !== payload.transaction?.status
    ) {
      throw new Error('Webhook payment data mismatch')
    }
    verifyDokuPaymentIdentity(payment, payload)

    const status = event.transaction_status

    if (status !== 'SUCCESS') {
      await client.query(
        `
          UPDATE payment_webhook_events
          SET processing_status = 'processed',
              processed_at = NOW(),
              attempt_count = attempt_count + 1,
              error_message = NULL,
              next_retry_at = NULL
          WHERE id = $1
        `,
        [eventId]
      )

      await client.query('COMMIT')

      return {
        status: 'ignored',
        paymentId,
      }
    }

    const paidAt = parseDokuTransactionDate(payload.transaction?.date)
    const transactionId = extractDokuTransactionId(payload)
    await saveDokuTransactionId(paymentId, transactionId, client)

    // Duplicate SUCCESS tidak boleh menulis applied_at atau mengganti paid_at.
    if (payment.status !== 'paid' || !payment.paid_at) {
      const paid = await markPaymentPaid(
        paymentId,
        paidAt,
        client
      )

      if (!paid) {
        throw new Error('Payment cannot transition to paid')
      }
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  // Lifecycle existing menjalankan transaksi sendiri.
  // Jika gagal, payment tetap paid dan dapat diproses ulang.
  const application = await applyVerifiedPremiumPayment(paymentId)

  await pool.query(
    `
      UPDATE payment_webhook_events
      SET processing_status = 'processed',
          processed_at = NOW(),
          attempt_count = attempt_count + 1,
          error_message = NULL,
          next_retry_at = NULL
      WHERE id = $1
        AND processing_status <> 'processed'
    `,
    [eventId]
  )

  return {
    status: 'processed',
    paymentId,
    application,
  }
}
