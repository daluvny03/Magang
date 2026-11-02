export function normalizeServerErrors(error, fallbackMessage = 'Terjadi kesalahan. Coba lagi.') {
  const response = error?.response
  const data = response?.data
  const rawErrors = data?.errors

  const fieldErrors = {}
  const codes = []

  if (Array.isArray(rawErrors)) {
    rawErrors.forEach((item) => {
      if (item?.code) codes.push(item.code)
      if (item?.field && item?.message) fieldErrors[item.field] = item.message
    })
  } else if (rawErrors && typeof rawErrors === 'object') {
    Object.entries(rawErrors).forEach(([field, messages]) => {
      const first = Array.isArray(messages) ? messages[0] : messages
      if (first) fieldErrors[field] = String(first)
    })
  }

  if (data?.code) codes.push(data.code)

  const message =
    data?.message ||
    Object.values(fieldErrors)[0] ||
    (error?.request && !response ? 'Tidak dapat terhubung ke server.' : fallbackMessage)

  return { message, fieldErrors, codes, status: response?.status ?? null }
}

/**
 * Terapkan fieldErrors ke react-hook-form, hanya untuk field yang ada di form.
 * Mengembalikan true bila minimal satu error berhasil ditampilkan di field.
 */
export function applyFieldErrors(fieldErrors, setError, allowedFields) {
  let applied = false

  Object.entries(fieldErrors).forEach(([field, message]) => {
    if (allowedFields && !allowedFields.includes(field)) return
    setError(field, { type: 'server', message })
    applied = true
  })

  return applied
}