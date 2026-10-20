
export const parseDokuExpiredDate = (value) => {
  if (!/^\d{14}$/.test(value ?? '')) {
    throw new Error('Invalid DOKU expiration format')
  }

  const year = Number(value.slice(0, 4))
  const month = Number(value.slice(4, 6))
  const day = Number(value.slice(6, 8))
  const hour = Number(value.slice(8, 10))
  const minute = Number(value.slice(10, 12))
  const second = Number(value.slice(12, 14))

  const iso = [
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`,
    `T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}+07:00`,
  ].join('')

  const date = new Date(iso)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    !Number.isInteger(second) ||
    !Number.isFinite(date.getTime())
  ) {
    throw new Error('Invalid DOKU expiration date')
  }

  const normalized = new Date(date.getTime() + 7 * 60 * 60 * 1000)

  if (
    normalized.getUTCFullYear() !== year ||
    normalized.getUTCMonth() + 1 !== month ||
    normalized.getUTCDate() !== day ||
    normalized.getUTCHours() !== hour ||
    normalized.getUTCMinutes() !== minute ||
    normalized.getUTCSeconds() !== second
  ) {
    throw new Error('Invalid DOKU calendar date')
  }

  return date
}
