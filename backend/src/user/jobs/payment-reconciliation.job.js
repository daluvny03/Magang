
import { recoveryPool as pool } from '../../config/payment-recovery-database.js'

import {
  findPaymentsForReconciliation,
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

    const failures = { webhook: 0, payment: 0, scheduling: 0, activation: 0, phase: 0 }
    const runPhase = async (phase, work) => {
      try {
        await work()
      } catch (error) {
        failures.phase += 1
        console.error('Payment recovery phase failed:', {
          phase,
          code: error.code ?? 'RECOVERY_PHASE_FAILED',
        })
      }
    }

    // 1. Recovery webhook.
    await runPhase('webhook', async () => {
      const events = await findRecoverableWebhookEvents(BATCH_SIZE, pool)

      for (const event of events) {
        try {
          await processRecordedDokuEvent(event.id, pool)
        } catch (error) {
          failures.webhook += 1
          console.error('Webhook recovery error:', {
            eventId: event.id,
            code: error.code ?? 'RECOVERY_FAILED',
          })
        }
      }
    })

    // 2. Pemeriksaan status DOKU.
    await runPhase('payment', async () => {
      const payments = await findPaymentsForReconciliation(BATCH_SIZE, pool)

      for (const payment of payments) {
        try {
          await reconcileDokuPayment(payment.id, { db: pool })
        } catch (error) {
          failures.payment += 1
          console.error('Payment reconciliation error:', {
            paymentId: payment.id,
            code: error.code ?? 'RECONCILIATION_FAILED',
          })
        } finally {
          try {
            await scheduleNextPaymentReconciliation(payment.id, pool)
          } catch (error) {
            failures.scheduling += 1
            console.error('Payment retry scheduling failed:', {
              paymentId: payment.id,
              code: error.code ?? 'RETRY_SCHEDULING_FAILED',
            })
          }
        }
      }
    })

    // 3. Aktivasi pembayaran yang sudah paid.
    await runPhase('activation', async () => {
      const results = await recoverUnappliedPremiumPayments(pool)
      failures.activation = results.filter((result) => result.status === 'failed').length
    })

    console.info('Payment recovery batch finished:', { failures })
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
