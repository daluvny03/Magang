
const MAX_TIMESTAMP_DRIFT_MS = 10 * 60 * 1000

const UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/

export const validateDokuWebhookHeaders = ({
  clientId,
  expectedClientId,
  requestId,
  requestTimestamp,
  signature,
}) => {
  if (
    typeof clientId !== 'string' ||
    !clientId ||
    clientId !== expectedClientId
  ) {
    return false
  }

  if (
    typeof requestId !== 'string' ||
    requestId.length < 1 ||
    requestId.length > 128
  ) {
    return false
  }

  if (
    typeof signature !== 'string' ||
    !/^HMACSHA256=[A-Za-z0-9+/]{43}=$/.test(signature)
  ) {
    return false
  }

  if (
    typeof requestTimestamp !== 'string' ||
    !UTC_TIMESTAMP_PATTERN.test(requestTimestamp)
  ) {
    return false
  }

  const timestamp = Date.parse(requestTimestamp)

  if (!Number.isFinite(timestamp)) {
    return false
  }

  const drift = Math.abs(Date.now() - timestamp)

  if (drift > MAX_TIMESTAMP_DRIFT_MS) {
    return false
  }

  return true
}
