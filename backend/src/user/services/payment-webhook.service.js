
import {
  findPaymentByInvoice,
  findWebhookEventByRequestId,
  saveWebhookEvent,
} from '../repositories/payment-webhook.repository.js'
import { pool } from '../../config/database.js'

import { markPaymentApplied } from
  '../repositories/payment.repository.js'

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

  const amount = Number(payload.order.amount)
  const expectedAmount = Number(payment.amount)

  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount !== expectedAmount ||
    payment.currency !== 'IDR'
  ) {
    return { status: 'payment_mismatch' }
  }

  const originalRequestId =
    payload.transaction.original_request_id

  if (
    originalRequestId != null &&
    originalRequestId !== payment.doku_request_id
  ) {
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
    const amount = Number(payload.order?.amount)

    if (
      event.invoice_number !== payment.invoice_number ||
      payload.order?.invoice_number !== payment.invoice_number ||
      !Number.isSafeInteger(amount) ||
      amount !== Number(payment.amount) ||
      payment.currency !== 'IDR'
    ) {
      throw new Error('Webhook payment data mismatch')
    }

    if (
      payload.transaction?.original_request_id != null &&
      payload.transaction.original_request_id !== payment.doku_request_id
    ) {
      throw new Error('Webhook request identifier mismatch')
    }

    const status = event.transaction_status

    if (status !== 'SUCCESS') {
      await client.query(
        `
          UPDATE payment_webhook_events
          SET processing_status = 'processed',
              processed_at = NOW(),
              attempt_count = attempt_count + 1,
              error_message = NULL
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

    const transactionDate = payload.transaction?.date
    const parsedDate = transactionDate
      ? new Date(transactionDate)
      : null

    if (
      !parsedDate ||
      !Number.isFinite(parsedDate.getTime()) ||
      !/Z$|[+-]\d{2}:\d{2}$/.test(transactionDate)
    ) {
      throw new Error('Invalid DOKU transaction date')
    }

    const paid = await markPaymentApplied(
      paymentId,
      parsedDate.toISOString(),
      client
    )

    if (!paid) {
      throw new Error('Payment cannot transition to paid')
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
          error_message = NULL
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
