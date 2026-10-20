
import { generateDokuSignature } from './doku-signature.js'

export const createDokuHeaders = ({
  clientId,
  secretKey,
  requestId,
  requestTarget,
  rawBody,
}) => {
  const requestTimestamp = new Date().toISOString()

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
