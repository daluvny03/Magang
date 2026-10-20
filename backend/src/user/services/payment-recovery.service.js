
import { pool } from '../../config/database.js'

import {
  checkDokuPaymentStatus,
} from '../clients/doku-status.client.js'

import {
  verifyDokuPaymentStatus,
} from '../validators/doku-payment-status.validator.js'

import {
  markPaymentApplied,
} from '../repositories/payment.repository.js'

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
import {
  markWebhookRecoveryFailed,
} from '../repositories/payment-webhook.repository.js'


export const getPaymentRecoveryCandidates = async () => {
  const [
    reconciliationPayments,
    unappliedPayments,
  ] = await Promise.all([
    findPaymentsForReconciliation(20),
    findUnappliedPaidPayments(20),
  ])

  return {
    reconciliationPayments,
    unappliedPayments,
  }
}

export const recoverUnappliedPremiumPayments = async () => {
  const payments = await findUnappliedPaidPayments(20)

  const results = []

  for (const payment of payments) {
    try {
      const result = await applyVerifiedPremiumPayment(
        payment.id
      )

      results.push({
        paymentId: payment.id,
        status: 'recovered',
        action: result.action,
      })
    } catch (error) {
      await scheduleNextPaymentReconciliation(payment.id)
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

export const recoverPendingWebhookEvents = async () => {
  const events = await findRecoverableWebhookEvents(20)
  const results = []

  for (const event of events) {
    try {
      const result = await processRecordedDokuEvent(
        event.id
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
      await markWebhookRecoveryFailed(event.id)

      results.push({
        eventId: event.id,
        status: 'failed',
      })
    }
  }

  return results
}

export const reconcileDokuPayment = async (paymentId) => {
  const initialResult = await pool.query(
    `
      SELECT *
      FROM payments
      WHERE id = $1
    `,
    [paymentId]
  )

  const initialPayment = initialResult.rows[0]

  if (
    !initialPayment ||
    !['pending', 'reconciling'].includes(
      initialPayment.status
    )
  ) {
    return { status: 'skipped', paymentId }
  }

  // HTTP request dilakukan di luar DB transaction.
  const dokuResponse = await checkDokuPaymentStatus({
    invoiceNumber: initialPayment.invoice_number,
  })

  const verification = verifyDokuPaymentStatus(
    initialPayment,
    dokuResponse
  )

  if (!verification.isPaid) {
    return {
      status: 'awaiting_payment',
      paymentId,
      dokuStatus: verification.status,
    }
  }

  const client = await pool.connect()

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
    verifyDokuPaymentStatus(payment, dokuResponse)

    if (
      payment.status === 'paid' &&
      payment.paid_at
    ) {
      await client.query('COMMIT')
    } else if (
      ['pending', 'reconciling'].includes(payment.status)
    ) {
      const updated = await markPaymentApplied(
        paymentId,
        verification.paidAt,
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
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  const application = await applyVerifiedPremiumPayment(
    paymentId
  )

  return {
    status: 'recovered',
    paymentId,
    application,
  }
}
