
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

const runRecoveryBatch = async (isStopping) => {
  const client = await pool.connect()
  let lockAcquired = false
  let discardClient = true
  let lockLost = false
  const shouldStop = () => isStopping() || lockLost
  const onClientError = () => { lockLost = true }
  client.on('error', onClientError)

  try {
    const lockResult = await client.query(
      `
        SELECT pg_try_advisory_lock($1, $2)
          AS acquired
      `,
      [LOCK_KEY_1, LOCK_KEY_2]
    )

    lockAcquired = lockResult.rows[0].acquired

    if (!lockAcquired) {
      discardClient = false
      return
    }

    const failures = { webhook: 0, payment: 0, scheduling: 0, activation: 0, phase: 0 }
    const runPhase = async (phase, work) => {
      if (shouldStop()) return
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
        if (shouldStop()) break
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
        if (shouldStop()) break
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
      const results = await recoverUnappliedPremiumPayments(pool, { shouldStop })
      failures.activation = results.filter((result) => result.status === 'failed').length
    })
  } finally {
    if (lockAcquired && !lockLost) {
      try {
        const result = await client.query(
          'SELECT pg_advisory_unlock($1, $2) AS unlocked',
          [LOCK_KEY_1, LOCK_KEY_2]
        )
        discardClient = result.rows[0]?.unlocked !== true
      } catch {
        // Timeout/koneksi terputus tidak membuktikan unlock berhasil.
        discardClient = true
        console.error('Recovery advisory unlock failed; destroying connection')
      }
    }
    client.removeListener('error', onClientError)
    client.release(discardClient || lockLost)
  }
}

export const startPaymentReconciliationJob = () => {
  let stopping = false
  let activeBatch = null
  const timer = setInterval(() => {
    if (stopping || activeBatch) return
    activeBatch = runRecoveryBatch(() => stopping)
      .catch((error) => {
        console.error('Payment recovery job failed:', {
          code: error.code ?? 'RECOVERY_JOB_FAILED',
        })
      })
      .finally(() => { activeBatch = null })
  }, INTERVAL_MS)
  timer.unref?.()

  return async () => {
    stopping = true
    clearInterval(timer)
    await activeBatch
  }
}
