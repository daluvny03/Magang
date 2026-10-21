import { useAuthStore } from '../../stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { useTryoutBoundaryRefresh } from './useTryoutBoundaryRefresh'

import { getUserTryouts } from '../services/tryout.service'

export const useTryouts = () => {
  const userId = useAuthStore((state) => state.user?.id)
  const query = useQuery({
    queryKey: ['user-tryouts', userId],
    queryFn: getUserTryouts,
    enabled: Boolean(userId),
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })
  useTryoutBoundaryRefresh(query.data?.data ?? [], query.refetch)
  return query
}
