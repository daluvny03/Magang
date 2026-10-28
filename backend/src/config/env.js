import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_NAME',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();

if (
  googleClientId &&
  !/^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(googleClientId)
) {
  throw new Error('GOOGLE_CLIENT_ID has an invalid format');
}
for (const envName of requiredEnv) {
  if (!process.env[envName]) {
    throw new Error(`Environment variable ${envName} is required`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',

  port: Number(process.env.PORT) || 5000,

  apiPrefix: process.env.API_PREFIX || '/api/v1',

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  database: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  google: {
    clientId: googleClientId || null,
  },

  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    provider: process.env.EMAIL_PROVIDER || 'resend',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE === undefined ? true : process.env.SMTP_SECURE === 'true',
      secureValid: process.env.SMTP_SECURE === undefined || ['true', 'false'].includes(process.env.SMTP_SECURE),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
    encryptionKey: process.env.EMAIL_OUTBOX_ENCRYPTION_KEY,
  },

  doku: {
    environment: process.env.DOKU_ENV || 'sandbox',
    clientId: process.env.DOKU_CLIENT_ID,
    secretKey: process.env.DOKU_SECRET_KEY,
    baseUrl: process.env.DOKU_BASE_URL || (
      process.env.DOKU_ENV === 'production'
        ? 'https://api.doku.com'
        : 'https://api-sandbox.doku.com'
    ),
    paymentMethodTypes: (process.env.DOKU_PAYMENT_METHOD_TYPES ||
      'VIRTUAL_ACCOUNT_BCA,VIRTUAL_ACCOUNT_BANK_MANDIRI,VIRTUAL_ACCOUNT_BRI,VIRTUAL_ACCOUNT_BNI,QRIS,CREDIT_CARD'
    ).split(',').map((value) => value.trim()),
    checkoutDueMinutes: Number(
      process.env.DOKU_CHECKOUT_DUE_MINUTES || 60
    ),
  },

};
