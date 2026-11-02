export const formatNumber = (value) => {
  if (value === null || value === undefined) return '—'

  const number = Number(value)

  if (!Number.isFinite(number)) return '—'

  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(number)
}

export const formatPercentage = (value) =>
  value === null || value === undefined ? '—' : `${formatNumber(value)}%`

// Panjang: "52 menit 30 detik"
export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return '—'

  const total = Number(seconds)

  if (!Number.isFinite(total) || total < 0) return '—'

  const whole = Math.floor(total)
  const hours = Math.floor(whole / 3600)
  const minutes = Math.floor((whole % 3600) / 60)
  const remainingSeconds = whole % 60

  return [
    hours > 0 ? `${hours} jam` : null,
    minutes > 0 ? `${minutes} menit` : null,
    remainingSeconds > 0 || whole === 0 ? `${remainingSeconds} detik` : null,
  ]
    .filter(Boolean)
    .join(' ')
}

// Ringkas untuk sel tabel: "2 j 5 mnt", "3 mnt 20 dtk", "45 dtk"
export const formatDurationShort = (seconds) => {
  if (seconds === null || seconds === undefined) return '—'

  const total = Number(seconds)

  if (!Number.isFinite(total) || total < 0) return '—'

  const rounded = Math.round(total)
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const remaining = rounded % 60

  if (hours > 0) return `${hours} j ${minutes} mnt`
  if (minutes > 0) return `${minutes} mnt ${remaining} dtk`

  return `${remaining} dtk`
}

export const formatRatio = (value) => {
  if (value === null || value === undefined) return '—'

  const number = Number(value)

  if (!Number.isFinite(number) || number < 0) return '—'

  return `${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(number)}×`
}