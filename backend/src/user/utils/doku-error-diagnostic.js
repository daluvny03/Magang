// Provider responses are untrusted: never log raw bodies, headers or Axios config.
// Only known generic messages are emitted; unknown free text may contain PII.
const SAFE_MESSAGES = new Set([
  'internal server error', 'internal server error.', 'internal system error',
  'bad request', 'invalid request', 'invalid request body', 'invalid signature',
  'unauthorized', 'forbidden', 'service unavailable', 'gateway timeout',
  'invalid client id', 'invalid client-id', 'duplicate request',
  'duplicate invoice number', 'invalid parameter', 'invalid parameters',
])

export const buildDokuErrorDiagnostic = (body, sensitiveValues = []) => {
  const containsSensitiveValue = (value) => sensitiveValues.some(
    (secret) => typeof secret === 'string' && secret.length > 0 &&
      value.toLowerCase().includes(secret.toLowerCase())
  )
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
  const bodyType = body == null ? 'empty' : Array.isArray(body) ? 'array' : typeof body
  const diagnostic = { bodyType, errors: [] }
  if (!object(body)) return diagnostic

  const candidates = [body, body.error, body.response,
    ...(Array.isArray(body.error_messages) ? body.error_messages.slice(0, 3) : []),
    ...(Array.isArray(body.errors) ? body.errors.slice(0, 3) : []),
  ]
  for (const entry of candidates) {
    if (!object(entry) || diagnostic.errors.length >= 3) continue
    const code = entry.code ?? entry.error_code ?? entry.responseCode
    const message = entry.message ?? entry.error_message ?? entry.responseMessage
    const item = {}
    // Bounded machine codes only, no free text, URL, whitespace or token punctuation.
    if (typeof code === 'string' && /^[A-Z][A-Z0-9_]{1,63}$|^\d{3,8}$/.test(code) &&
        !containsSensitiveValue(code)) item.code = code
    else if (code != null) item.codeOmitted = true
    if (typeof message === 'string' && message.length <= 100 &&
        SAFE_MESSAGES.has(message.toLowerCase()) && !containsSensitiveValue(message)) {
      item.message = message.toLowerCase()
    } else if (message != null) item.messageOmitted = true
    if (Object.keys(item).length) diagnostic.errors.push(item)
  }
  return diagnostic
}
