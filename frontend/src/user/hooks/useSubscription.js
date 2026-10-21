
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { isSubscriptionActive } from '../utils/subscription-date'

import {
  getActiveSubscription,
  getSubscriptionCatalog,
} from '../services/subscription.service'

export const useSubscription = () => {
  const userId = useAuthStore((state) => state.user?.id)
  const [clockTick, setClockTick] = useState(0)
  const query = useQuery({
    queryKey: ['user-subscription', userId],
    queryFn: getActiveSubscription,
    enabled: Boolean(userId),
    refetchOnWindowFocus: true,
  })

  const expiredAt = query.data?.data?.expiredAt
  const { refetch } = query

  useEffect(() => {
    if (!userId || !expiredAt) return
    const remaining = new Date(expiredAt).getTime() - Date.now()
    if (!Number.isFinite(remaining) || remaining <= 0) return

    // Batasi delay agar subscription tahunan tidak melampaui batas setTimeout.
    const timer = setTimeout(() => {
      setClockTick((value) => value + 1)
      if (new Date(expiredAt).getTime() <= Date.now()) void refetch()
    }, Math.min(remaining + 50, 24 * 60 * 60 * 1000))

    return () => clearTimeout(timer)
  }, [userId, expiredAt, refetch, clockTick])

  // Jangan tampilkan cache yang sudah expired, termasuk ketika refetch gagal.
  return {
    ...query,
    data: query.data
      ? { ...query.data, data: isSubscriptionActive(query.data.data) ? query.data.data : null }
      : query.data,
  }
}

export const useSubscriptionCatalog = () => {
  return useQuery({
    queryKey: ['user-subscription-catalog'],
    queryFn: getSubscriptionCatalog,
  })
}
