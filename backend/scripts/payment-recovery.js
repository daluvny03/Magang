import { parseArgs } from 'node:util'
import { readFile } from 'node:fs/promises'
import { recoveryPool } from '../src/config/payment-recovery-database.js'
import { inspectRecoveryPayment, closeUnpaidRecoveryPayment } from '../src/user/services/payment-operator.service.js'
import { reconcileDokuPayment } from '../src/user/services/payment-recovery.service.js'
import { applyVerifiedPremiumPayment } from '../src/user/services/subscription-lifecycle.service.js'

// Command lokal untuk operator pemegang akses backend/database, bukan HTTP API.
// Jalankan hanya setelah fase testing diizinkan; agent tidak mengeksekusinya.
try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      evidence: { type: 'string' },
      execute: { type: 'boolean', default: false },
      'confirm-invoice': { type: 'string' },
      'maintenance-confirmed': { type: 'boolean', default: false },
    },
  })
  const [action, paymentId] = positionals
  if (positionals.length !== 2 || !/^[1-9]\d*$/.test(paymentId ?? '') ||
      !['inspect', 'reconcile', 'close-unpaid'].includes(action)) {
    throw new Error('Usage: node scripts/payment-recovery.js inspect|reconcile|close-unpaid PAYMENT_ID')
  }
  const payment = await inspectRecoveryPayment(paymentId)
  if (action === 'inspect' || !values.execute) {
  } else {
    if (values['confirm-invoice'] !== payment.invoiceNumber) {
      throw new Error('Explicit --confirm-invoice matching this payment is required')
    }
    let result
    if (action === 'reconcile') {
      // Tidak membuat checkout/replay, termasuk untuk payment legacy.
      result = payment.status === 'paid'
        ? await applyVerifiedPremiumPayment(paymentId, recoveryPool)
        : await reconcileDokuPayment(paymentId, { allowReplay: false, includeClosed: true })
    } else {
      if (!values.evidence) throw new Error('--evidence FILE is required')
      const evidence = JSON.parse(await readFile(values.evidence, 'utf8'))
      result = await closeUnpaidRecoveryPayment({
        paymentId,
        evidence,
        confirmedInvoice: values['confirm-invoice'],
        maintenanceConfirmed: values['maintenance-confirmed'],
      })
    }
  }
} catch (error) {
  console.error('Payment operator command failed:', { code: error.code ?? 'OPERATOR_COMMAND_FAILED', message: error.code ? undefined : error.message })
  process.exitCode = 1
} finally {
  await recoveryPool.end()
}
