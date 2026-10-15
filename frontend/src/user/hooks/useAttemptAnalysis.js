
import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../stores/authStore'

import {
  getAttemptAnalysis,
} from '../services/analysis.service'

export const useAttemptAnalysis = (
  attemptId
) => {
  const userId = useAuthStore(
    (state) => state.user?.id
  )

  return useQuery({
    queryKey: [
      'user',
      userId,
      'attempt-analysis',
      String(attemptId),
    ],

    queryFn: () =>
      getAttemptAnalysis(attemptId),

    enabled: Boolean(userId) && Boolean(attemptId),

    staleTime: 60 * 1000,

    retry: (failureCount, error) => {
      const status = error?.response?.status

      if ([401, 403, 404, 409, 422].includes(status)) {
        return false
      }

      return failureCount < 2
    },
  })
}
