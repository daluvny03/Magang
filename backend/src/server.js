import app from './app.js';
import { env } from './config/env.js';
import { testDatabaseConnection } from './config/database.js';

const startServer = async () => {
  try {
    await testDatabaseConnection();

    app.listen(env.port, () => {
      console.log(
        `Backend server running at http://localhost:${env.port}`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();