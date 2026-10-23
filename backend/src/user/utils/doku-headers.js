
import { generateDokuSignature } from './doku-signature.js'

export const createDokuHeaders = ({
  clientId,
  secretKey,
  requestId,
  requestTarget,
  rawBody,
}) => {
  // Match DOKU's documented UTC format and the working demo (whole seconds).
  // Sign this exact value; never format the transmitted header separately.
  const requestTimestamp = new Date().toISOString().slice(0, 19) + 'Z'

  const signature = generateDokuSignature({
    clientId,
    secretKey,
    requestId,
    requestTimestamp,
    requestTarget,
    rawBody,
  })

  return {
    'Client-Id': clientId,
    'Request-Id': requestId,
    'Request-Timestamp': requestTimestamp,
    Signature: signature,
    'Content-Type': 'application/json',
  }
}
