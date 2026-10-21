export const hasActiveTryoutAttempt = (tryout) => Boolean(
  tryout?.activeAttempt?.id &&
  new Date(tryout.activeAttempt.expiresAt).getTime() > Date.now()
)

export const getTryoutScheduleStatus = (tryout) => {
  const now = Date.now()
  if (tryout.startAt && new Date(tryout.startAt).getTime() > now) return 'upcoming'
  if (tryout.endAt && new Date(tryout.endAt).getTime() < now) return 'ended'
  return 'active'
}
