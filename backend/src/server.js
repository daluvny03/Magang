import { startSubscriptionExpiryJob } from './jobs/subscription-expiry.job.js';
import { startEmailDeliveryJob } from './jobs/email-delivery.job.js';
import { getEmailConfig } from './email/email-config.js';
import app from './app.js';
import { env } from './config/env.js';
import { pool, testDatabaseConnection } from './config/database.js';
import { recoveryPool } from './config/payment-recovery-database.js';
import { startPaymentReconciliationJob } from './user/jobs/payment-reconciliation.job.js';

let server;
let stopRecovery = async () => {};
let stopExpiry = async () => {};
let stopEmail = async () => {};
let shuttingDown = false;

const shutdown = async (reason, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info('Server shutting down', { reason });
  // Batas terakhir jika HTTP/database/provider tidak selesai. Recovery existing
  // menangani hasil commit yang belum pasti setelah proses dimulai kembali.
  const deadline = setTimeout(() => {
    console.error('Graceful shutdown deadline exceeded');
    server?.closeAllConnections?.();
    process.exit(1);
  }, 60000);
  try {
    const drainHttp = server ? new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeIdleConnections?.();
    }) : Promise.resolve();
    await Promise.all([drainHttp, stopRecovery(), stopEmail(), stopExpiry()]);
    await Promise.all([pool.end(), recoveryPool.end()]);
    clearTimeout(deadline);
    process.exitCode = exitCode;
  } catch {
    console.error('Graceful shutdown failed');
    clearTimeout(deadline);
    process.exit(1);
  }
};

process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
process.once('SIGINT', () => { void shutdown('SIGINT'); });

const startServer = async () => {
  try {
    if (env.email.enabled) getEmailConfig();
    await testDatabaseConnection();
    if (shuttingDown) return;
    server = app.listen(env.port, () => {
      if (shuttingDown) return;
      console.info('Backend server listening', { port: env.port });
      stopExpiry = startSubscriptionExpiryJob();
      if (env.email.enabled) stopEmail = startEmailDeliveryJob();
      if (process.env.PAYMENT_RECOVERY_ENABLED === 'true') {
        stopRecovery = startPaymentReconciliationJob();
      }
    });
    server.on('error', () => { void shutdown('LISTEN_ERROR', 1); });
  } catch {
    await shutdown('STARTUP_ERROR', 1);
  }
};

void startServer();
