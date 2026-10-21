// Versi 1 harus tetap stabil: PostgreSQL JSONB tidak mempertahankan urutan key.
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])])
    )
  }
  return value
}

export const serializeCheckoutBody = (body) =>
  JSON.stringify(canonicalize(body))

export const buildCheckoutSnapshot = ({ invoiceNumber, amount, config }) => ({
  version: 1,
  environment: config.environment,
  clientId: config.clientId,
  body: {
    order: { invoice_number: invoiceNumber, amount: Number(amount) },
    payment: {
      payment_due_date: config.checkoutDueMinutes,
      payment_method_types: [...config.paymentMethodTypes],
    },
  },
})

export const validateCheckoutAccount = (snapshot, config) => {
  if (
    !snapshot ||
    snapshot.environment !== config.environment ||
    snapshot.clientId !== config.clientId
  ) {
    const error = new Error('Checkout DOKU account cannot be verified')
    error.code = 'DOKU_CHECKOUT_ACCOUNT_MISMATCH'
    throw error
  }
}

export const validateCheckoutSnapshot = (snapshot, payment, config) => {
  validateCheckoutAccount(snapshot, config)
  const body = snapshot?.body
  if (
    snapshot?.version !== 1 ||
    snapshot.environment !== config.environment ||
    snapshot.clientId !== config.clientId ||
    body?.order?.invoice_number !== payment.invoice_number ||
    body?.order?.amount !== Number(payment.amount) ||
    !Number.isSafeInteger(body?.order?.amount) ||
    body.order.amount <= 0 ||
    body.order.amount > 999999999999 ||
    !Number.isInteger(body?.payment?.payment_due_date) ||
    body.payment.payment_due_date < 1 ||
    body.payment.payment_due_date > 999999 ||
    !Array.isArray(body?.payment?.payment_method_types) ||
    !body.payment.payment_method_types.length ||
    body.payment.payment_method_types.some((method) => typeof method !== 'string')
  ) {
    const error = new Error('Checkout snapshot missing, invalid, or belongs to another DOKU account')
    error.code = 'DOKU_CHECKOUT_SNAPSHOT_INVALID'
    throw error
  }
  return body
}
