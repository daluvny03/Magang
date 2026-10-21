import { validateDokuWebhookHeaders } from '../validators/doku-webhook.validator.js'
import { verifyDokuSignature } from '../utils/doku-signature.js'
import { env } from '../../config/env.js'
import {
  recordDokuWebhook,
  processRecordedDokuEvent,
} from '../services/payment-webhook.service.js'

const NOTIFICATION_TARGET =
  '/api/v1/payments/doku/notifications'

export const receiveDokuNotification = async (req, res) => {
  const clientId = req.get('Client-Id')
  const requestId = req.get('Request-Id')
  const requestTimestamp = req.get('Request-Timestamp')
  const signature = req.get('Signature')

  if (!env.doku?.clientId || !env.doku?.secretKey) {
    return res.sendStatus(503)
  }

  if (!Buffer.isBuffer(req.body)) {
    return res.sendStatus(400)
  }

  const headersValid = validateDokuWebhookHeaders({
    clientId,
    expectedClientId: env.doku.clientId,
    requestId,
    requestTimestamp,
    signature,
  })

  if (!headersValid) {
    return res.sendStatus(401)
  }

  const rawBody = req.body.toString('utf8')

  let signatureValid = false

  try {
    signatureValid = verifyDokuSignature({
      receivedSignature: signature,
      clientId,
      requestId,
      requestTimestamp,
      requestTarget: NOTIFICATION_TARGET,
      rawBody,
      secretKey: env.doku.secretKey,
    })
  } catch {
    return res.sendStatus(401)
  }

  if (!signatureValid) {
    return res.sendStatus(401)
  }

  let payload

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return res.sendStatus(400)
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload) ||
    typeof payload.order?.invoice_number !== 'string' ||
    !payload.order.invoice_number ||
    typeof payload.transaction?.status !== 'string'
  ) {
    return res.sendStatus(400)
  }

  let eventId = null

  try {
    const result = await recordDokuWebhook({
      requestId,
      payload,
    })

    if (
      result.status === 'payment_not_found' ||
      result.status === 'payment_mismatch'
    ) {
      return res.sendStatus(422)
    }

    if (result.status === 'event_conflict') {
      return res.sendStatus(409)
    }

    if (
      result.status === 'duplicate' &&
      result.processingStatus === 'processed'
    ) {
      return res.sendStatus(200)
    }

    if (!result.eventId) {
      return res.sendStatus(503)
    }

    eventId = result.eventId
    await processRecordedDokuEvent(eventId)

    return res.sendStatus(200)
  } catch (error) {
    console.error('DOKU webhook processing failed:', {
      eventId,
      requestId,
      code: error.code ?? 'WEBHOOK_PROCESSING_ERROR',
    })

    return res.sendStatus(503)
  }
}
