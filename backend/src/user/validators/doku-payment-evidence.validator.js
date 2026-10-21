// Hanya untuk bukti dari webhook dengan signature valid atau Check Status
// melalui client DOKU tepercaya. Bukan validator payload dari browser.
export const verifyDokuPaymentIdentity = (payment, payload) => {
  const amount = payload?.order?.amount
  const numericAmount = Number(amount)
  if (
    !payment ||
    payload?.order?.invoice_number !== payment.invoice_number ||
    !['number', 'string'].includes(typeof amount) ||
    !Number.isSafeInteger(numericAmount) ||
    numericAmount <= 0 ||
    numericAmount !== Number(payment.amount) ||
    payment.currency !== 'IDR' ||
    (payload.order.currency != null && payload.order.currency !== payment.currency)
  ) {
    throw new Error('DOKU payment data mismatch')
  }

  const originalRequestId = payload.transaction?.original_request_id
  const channel = payload.channel?.id
  if (originalRequestId != null) {
    // Contoh Check Status Alfa memakai invoice sebagai original_request_id.
    const isAlfaInvoice = channel === 'ONLINE_TO_OFFLINE_ALFA' &&
      originalRequestId === payment.invoice_number
    if (
      typeof originalRequestId !== 'string' ||
      !originalRequestId ||
      (originalRequestId !== payment.doku_request_id && !isAlfaInvoice)
    ) {
      throw new Error('DOKU request identifier mismatch')
    }
  } else if (payload.transaction?.status === 'SUCCESS') {
    // Notifikasi QRIS yang didokumentasikan tidak menyertakan original_request_id.
    // Jangan memperluas pengecualian ini ke channel yang tidak dikenal.
    const isQris = payload.service?.id === 'QRIS' && channel === 'QRIS_DOKU'
    if (!isQris) throw new Error('DOKU request identifier missing')
  }
}

export const parseDokuTransactionDate = (value) => {
  const match = typeof value === 'string' && value.match(
    /^(\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d)(?:\.(\d{1,3}))?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/
  )
  if (!match) throw new Error('Invalid DOKU transaction date')

  // Date.parse dapat menormalisasi tanggal kalender yang tidak valid.
  const localIso = `${match[1]}.${(match[2] ?? '').padEnd(3, '0')}Z`
  const localDate = new Date(localIso)
  const date = new Date(value)
  if (
    !Number.isFinite(localDate.getTime()) ||
    localDate.toISOString() !== localIso ||
    !Number.isFinite(date.getTime())
  ) {
    throw new Error('Invalid DOKU transaction date')
  }
  return date.toISOString()
}
