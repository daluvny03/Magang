
import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../stores/authStore'
import {
  getAttemptStatistics,
} from '../services/statistics.service'

export const useAttemptStatistics = () => {
  const userId = useAuthStore(
    (state) => state.user?.id
  )

  return useQuery({
    queryKey: [
      'user',
      userId,
      'attempt-statistics',
    ],

    queryFn: ({ signal }) =>
      getAttemptStatistics({ signal }),

    enabled: Boolean(userId),

    staleTime: 60 * 1000,

    retry: (failureCount, error) => {
      const status = error?.response?.status

      if (
        [400, 401, 403, 404, 422].includes(status)
      ) {
        return false
      }

      return failureCount < 2
    },
  })
}
