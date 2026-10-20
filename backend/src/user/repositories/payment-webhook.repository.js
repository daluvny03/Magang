
import { pool } from '../../config/database.js'

export const findPaymentByInvoice = async (
  invoiceNumber,
  client = pool
) => {
  const { rows } = await client.query(
    `
      SELECT
        id,
        invoice_number,
        doku_request_id,
        amount,
        currency,
        status
      FROM payments
      WHERE invoice_number = $1
      LIMIT 1
    `,
    [invoiceNumber]
  )

  return rows[0] ?? null
}

export const saveWebhookEvent = async ({
  paymentId,
  requestId,
  invoiceNumber,
  transactionStatus,
  payload,
}) => {
  const { rows } = await pool.query(
    `
      INSERT INTO payment_webhook_events (
        payment_id,
        provider,
        event_request_id,
        invoice_number,
        event_type,
        transaction_status,
        payload,
        processing_status,
        attempt_count
      )
      VALUES (
        $1,
        'doku',
        $2,
        $3,
        'payment_notification',
        $4,
        $5::jsonb,
        'received',
        0
      )
      ON CONFLICT (provider, event_request_id)
      DO NOTHING
      RETURNING id, processing_status
    `,
    [
      paymentId,
      requestId,
      invoiceNumber,
      transactionStatus,
      JSON.stringify(payload),
    ]
  )

  return rows[0] ?? null
}

export const findWebhookEventByRequestId = async (
  requestId
) => {
  const { rows } = await pool.query(
    `
      SELECT
        id,
        payment_id,
        invoice_number,
        transaction_status,
        payload,
        processing_status
      FROM payment_webhook_events
      WHERE provider = 'doku'
        AND event_request_id = $1
      LIMIT 1
    `,
    [requestId]
  )

  return rows[0] ?? null
}

export const isSameWebhookPayload = async ({
  requestId,
  paymentId,
  invoiceNumber,
  transactionStatus,
  payload,
}) => {
  const { rows } = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM payment_webhook_events
        WHERE provider = 'doku'
          AND event_request_id = $1
          AND payment_id = $2
          AND invoice_number = $3
          AND transaction_status = $4
          AND payload = $5::jsonb
      ) AS matches
    `,
    [
      requestId,
      paymentId,
      invoiceNumber,
      transactionStatus,
      JSON.stringify(payload),
    ]
  )

  return rows[0].matches
}


export const findRecoverableWebhookEvents = async (
  limit = 20
) => {
  const { rows } = await pool.query(
    `
      SELECT id, payment_id, processing_status
      FROM payment_webhook_events
      WHERE provider = 'doku'
        AND processing_status IN ('received', 'failed')
        AND attempt_count < 8
        AND (
          next_retry_at IS NULL
          OR next_retry_at <= NOW()
        )
        AND received_at <= NOW() - INTERVAL '60 seconds'
      ORDER BY received_at ASC, id ASC
      LIMIT $1
    `,
    [limit]
  )

  return rows
}

export const markWebhookRecoveryFailed = async (
  eventId
) => {
  await pool.query(
    `
      UPDATE payment_webhook_events
      SET
        processing_status = 'failed',
        attempt_count = attempt_count + 1,
        error_message = 'Recovery processing failed',
        next_retry_at = NOW()
          + (
            LEAST(
              3600,
              60 * POWER(2, LEAST(attempt_count, 6))
            ) * INTERVAL '1 second'
          )
      WHERE id = $1
        AND processing_status <> 'processed'
    `,
    [eventId]
  )
}
