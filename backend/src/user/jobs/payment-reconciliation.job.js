
import { pool } from '../../config/database.js'

import {
  findPaymentsForReconciliation,
  findUnappliedPaidPayments,
  scheduleNextPaymentReconciliation,
} from '../repositories/payment.repository.js'

import {
  findRecoverableWebhookEvents,
} from '../repositories/payment-webhook.repository.js'

import {
  reconcileDokuPayment,
  recoverUnappliedPremiumPayments,
} from '../services/payment-recovery.service.js'

import {
  processRecordedDokuEvent,
} from '../services/payment-webhook.service.js'

const LOCK_KEY_1 = 7105
const LOCK_KEY_2 = 2026

const BATCH_SIZE = 20
const INTERVAL_MS = 5 * 60 * 1000

const runRecoveryBatch = async () => {
  const client = await pool.connect()
  let lockAcquired = false

  try {
    const lockResult = await client.query(
      `
        SELECT pg_try_advisory_lock($1, $2)
          AS acquired
      `,
      [LOCK_KEY_1, LOCK_KEY_2]
    )

    lockAcquired = lockResult.rows[0].acquired

    if (!lockAcquired) return

    // 1. Recovery webhook.
    const events = await findRecoverableWebhookEvents(
      BATCH_SIZE
    )

    for (const event of events) {
      try {
        await processRecordedDokuEvent(event.id)
      } catch (error) {
        console.error('Webhook recovery error:', {
          eventId: event.id,
          code: error.code ?? 'RECOVERY_FAILED',
        })
      }
    }

    // 2. Pemeriksaan status DOKU.
    const payments = await findPaymentsForReconciliation(
      BATCH_SIZE
    )

    for (const payment of payments) {
      try {
        await reconcileDokuPayment(payment.id)
      } catch (error) {
        console.error('Payment reconciliation error:', {
          paymentId: payment.id,
          code: error.code ?? 'RECONCILIATION_FAILED',
        })
      } finally {
        await scheduleNextPaymentReconciliation(
          payment.id
        )
      }
    }

    // 3. Aktivasi pembayaran yang sudah paid.
    await recoverUnappliedPremiumPayments()

    console.info('Payment recovery batch completed')
  } finally {
    if (lockAcquired) {
      try {
        await client.query(
          'SELECT pg_advisory_unlock($1, $2)',
          [LOCK_KEY_1, LOCK_KEY_2]
        )
      } finally {
        client.release()
      }
    } else {
      client.release()
    }
  }
}

export const startPaymentReconciliationJob = () => {
  const timer = setInterval(() => {
    runRecoveryBatch().catch((error) => {
      console.error('Payment recovery job failed:', {
        code: error.code ?? 'RECOVERY_JOB_FAILED',
      })
    })
  }, INTERVAL_MS)

  timer.unref?.()

  return () => clearInterval(timer)
}
