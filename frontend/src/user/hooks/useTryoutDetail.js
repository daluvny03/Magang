import { useAuthStore } from '../../stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { useTryoutBoundaryRefresh } from './useTryoutBoundaryRefresh'

import {
  getUserTryoutById
} from '../services/tryout.service'

export const useTryoutDetail = (tryoutId) => {
  const userId = useAuthStore((state) => state.user?.id)
  const query = useQuery({
    queryKey: [
      'user-tryout-detail',
      userId,
      String(tryoutId),
    ],
    queryFn: ({ signal }) =>
      getUserTryoutById(tryoutId, { signal }),
    enabled: Boolean(userId && tryoutId),
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  })
  useTryoutBoundaryRefresh(query.data?.data ? [query.data.data] : [], query.refetch)
  return query
}
