import express from 'express';
import cors from 'cors';
import path from 'path';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import dokuWebhookRoutes from './user/routes/doku-webhook.routes.js'

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    exposedHeaders: ['X-Request-Id', 'Retry-After']
  })
);
app.use(
  '/uploads',
  express.static(
    path.resolve('uploads')
  )
);
app.use(
  '/api/v1/payments/doku',
  dokuWebhookRoutes
)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(env.apiPrefix, routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
