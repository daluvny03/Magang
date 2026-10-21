// Mapping identifier transaksi acquiring yang terdokumentasi di notifikasi
// Non-SNAP. Jangan memakai Request-Id, nomor VA, approval code, atau invoice
// sebagai pengganti identifier transaksi yang tidak tersedia.
const IDENTIFIERS = {
  VIRTUAL_ACCOUNT_BANK_MANDIRI: ['virtual_account_payment', 'TRANSACTION_ID'],
  VIRTUAL_ACCOUNT_BRI: ['virtual_account_payment', 'TRANSAKSI_ID'],
  VIRTUAL_ACCOUNT_BNI: ['virtual_account_payment', 'TRX_ID'],
  VIRTUAL_ACCOUNT_BANK_PERMATA: ['virtual_account_payment', 'TRANSAKSI_ID'],
  VIRTUAL_ACCOUNT_DOKU: ['virtual_account_payment', 'TRANSACTION_NUMBER'],
  ONLINE_TO_OFFLINE_ALFA: ['online_to_offline_payment', 'AGENT_TRX_ID'],
  ONLINE_TO_OFFLINE_INDOMARET: ['online_to_offline_payment', 'AGENT_TRX_ID'],
}

export const extractDokuTransactionId = (payload) => {
  const channel = payload?.channel?.id
  if (typeof channel !== 'string') return null
  const mapping = Object.hasOwn(IDENTIFIERS, channel) && IDENTIFIERS[channel]
  if (!mapping) return null
  const [section, name] = mapping
  const identifiers = payload[section]?.identifier
  if (!Array.isArray(identifiers)) return null
  const entries = identifiers.filter((entry) => entry?.name === name)
  if (!entries.length) return null

  const values = entries.map((entry) => entry.value)
  if (values.some((value) =>
    typeof value !== 'string' ||
    !/^[A-Za-z0-9._:/-]{1,255}$/.test(value)
  ) || new Set(values).size !== 1) {
    // Identifier opsional yang ambigu tidak ditebak; payload event tetap tersimpan.
    return null
  }
  // Namespace channel dan nama field mencegah pencampuran referensi antarbank.
  return `${channel}:${name}:${values[0]}`
}
