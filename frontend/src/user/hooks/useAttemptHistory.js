import { useAuthStore } from '../../stores/authStore'
import { useQuery } from '@tanstack/react-query'
import {
  getAttemptHistory,
} from '../services/history.service'

export const useAttemptHistory = ({
  page = 1,
  limit = 10,
} = {}) => {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: [
      'user',
      userId,
      'attempt-history',
      page,
      limit,
    ],
    queryFn: ({ signal }) =>
      getAttemptHistory({
        page,
        limit,
        signal,
      }),
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  })
}
