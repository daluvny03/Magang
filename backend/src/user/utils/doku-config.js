import { env } from '../../config/env.js'

const ORIGINS = {
  sandbox: {
    api: 'https://api-sandbox.doku.com',
    checkout: 'https://sandbox.doku.com',
  },
  production: {
    api: 'https://api.doku.com',
    checkout: 'https://jokul.doku.com',
  },
}

// Hanya metode yang didukung oleh payload basic aplikasi.
const BASIC_METHODS = new Set([
  'VIRTUAL_ACCOUNT_BCA',
  'VIRTUAL_ACCOUNT_BANK_MANDIRI',
  'VIRTUAL_ACCOUNT_BRI',
  'VIRTUAL_ACCOUNT_BNI',
  'VIRTUAL_ACCOUNT_BANK_PERMATA',
  'VIRTUAL_ACCOUNT_DOKU',
  'QRIS',
  'CREDIT_CARD',
  'ONLINE_TO_OFFLINE_ALFA',
  'ONLINE_TO_OFFLINE_INDOMARET',
  'EMONEY_OVO',
  'EMONEY_LINKAJA',
])

const configError = () => {
  const error = new Error('DOKU checkout configuration is invalid or incomplete')
  error.code = 'DOKU_CONFIGURATION_INVALID'
  error.statusCode = 503
  return error
}

export const validateDokuConfig = ({ checkout = false } = {}) => {
  const config = env.doku
  const origins = ORIGINS[config.environment]
  if (!origins || !config.clientId?.trim() || !config.secretKey?.trim()) {
    throw configError()
  }

  // Tolak path tambahan, query, credentials, HTTP, dan origin environment lain.
  if (config.baseUrl?.replace(/\/$/, '') !== origins.api) {
    throw configError()
  }

  if (checkout && (
    !Number.isInteger(config.checkoutDueMinutes) ||
    config.checkoutDueMinutes < 1 ||
    config.checkoutDueMinutes > 999999 ||
    !config.paymentMethodTypes.length ||
    config.paymentMethodTypes.some((method) => !BASIC_METHODS.has(method))
  )) {
    throw configError()
  }

  return { ...config, baseUrl: origins.api, checkoutOrigin: origins.checkout }
}

export const validateDokuPaymentUrl = (value, checkoutOrigin) => {
  const url = new URL(value)
  if (
    url.origin !== checkoutOrigin ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new Error('Invalid DOKU payment URL')
  }
  return url.toString()
}
