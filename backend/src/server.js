import app from './app.js';
import { env } from './config/env.js';
import { testDatabaseConnection } from './config/database.js';
import {
  startPaymentReconciliationJob,
} from './user/jobs/payment-reconciliation.job.js';

const startServer = async () => {
  try {
    await testDatabaseConnection();

    app.listen(env.port, () => {
      console.log(
        `Backend server running at http://localhost:${env.port}`
      );

      if (process.env.PAYMENT_RECOVERY_ENABLED === 'true') {
        startPaymentReconciliationJob();
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
