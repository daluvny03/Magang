import { AppError } from '../../utils/app-error.js'

const MAX_BIGINT = 9223372036854775807n

// Keep PostgreSQL bigint IDs as decimal strings, including above 2^53.
export const validateTryoutId = (value) => {
  if ((typeof value === 'number' && !Number.isSafeInteger(value)) ||
      !['string', 'number', 'bigint'].includes(typeof value)) {
    throw new AppError('Invalid tryout ID', 400, 'INVALID_TRYOUT_ID')
  }
  const id = String(value)
  if (!/^[1-9]\d*$/.test(id) || id.length > 19 || BigInt(id) > MAX_BIGINT) {
    throw new AppError('Invalid tryout ID', 400, 'INVALID_TRYOUT_ID')
  }
  return id
}
