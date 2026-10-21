export const formatSubscriptionDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date)
}

export const isSubscriptionActive = (subscription) =>
  subscription?.status === 'active' &&
  new Date(subscription.startedAt).getTime() <= Date.now() &&
  new Date(subscription.expiredAt).getTime() > Date.now()
