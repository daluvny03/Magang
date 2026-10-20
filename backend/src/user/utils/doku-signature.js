
import {
  createHash,
  createHmac,
  timingSafeEqual,
} from 'node:crypto'

export const generateDokuDigest = (rawBody) => {
  if (typeof rawBody !== 'string') {
    throw new TypeError('DOKU body must be a string')
  }

  return createHash('sha256')
    .update(rawBody, 'utf8')
    .digest('base64')
}

export const generateDokuSignature = ({
  clientId,
  requestId,
  requestTimestamp,
  requestTarget,
  rawBody,
  secretKey,
}) => {
  if (
    !clientId ||
    !requestId ||
    !requestTimestamp ||
    !requestTarget ||
    !secretKey
  ) {
    throw new Error('Missing DOKU signature configuration')
  }

  const components = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${requestTarget}`,
  ]

  if (rawBody !== undefined && rawBody !== null) {
    components.push(
      `Digest:${generateDokuDigest(rawBody)}`
    )
  }

  const stringToSign = components.join('\n')

  const signature = createHmac('sha256', secretKey)
    .update(stringToSign, 'utf8')
    .digest('base64')

  return `HMACSHA256=${signature}`
}

export const verifyDokuSignature = ({
  receivedSignature,
  ...signatureParams
}) => {
  if (typeof receivedSignature !== 'string') {
    return false
  }

  const expectedSignature =
    generateDokuSignature(signatureParams)

  const receivedBuffer = Buffer.from(
    receivedSignature,
    'utf8'
  )

  const expectedBuffer = Buffer.from(
    expectedSignature,
    'utf8'
  )

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  )
}
