import { useEffect, useState } from 'react'

// Menyegarkan batas jadwal/attempt tanpa mengubah timer CAT.
export const useTryoutBoundaryRefresh = (tryouts, refetch) => {
  const [tick, setTick] = useState(0)
  const boundaries = tryouts.flatMap((tryout) => [
    tryout.startAt, tryout.endAt, tryout.activeAttempt?.expiresAt,
  ]).filter(Boolean).join('|')

  useEffect(() => {
    const now = Date.now()
    const upcoming = boundaries.split('|').map((value) => new Date(value).getTime())
      .filter((value) => Number.isFinite(value) && value >= now)
    if (!upcoming.length) return
    const next = Math.min(...upcoming)
    const timer = setTimeout(() => {
      setTick((value) => value + 1)
      if (Date.now() >= next) void refetch()
    }, Math.min(next - now + 50, 24 * 60 * 60 * 1000))
    return () => clearTimeout(timer)
  }, [boundaries, refetch, tick])
}
