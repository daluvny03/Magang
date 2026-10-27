
import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../stores/authStore'

import {
  getAttemptAnalysisSummary,
} from '../services/analysis.service'

export const useAttemptAnalysisSummary = (
  attemptId
) => {
  const userId = useAuthStore(
    (state) => state.user?.id
  )

  const isValidAttemptId =
    /^[1-9]\d*$/.test(String(attemptId ?? ''))

  return useQuery({
    queryKey: [
      'user',
      userId,
      'attempt-analysis-summary',
      String(attemptId),
    ],

    queryFn: ({ signal }) =>
      getAttemptAnalysisSummary(attemptId, { signal }),

    enabled:
      Boolean(userId) &&
      isValidAttemptId,

    staleTime: 60 * 1000,

    retry: (failureCount, error) => {
      const status = error?.response?.status

      if ([400, 401, 403, 404, 409, 422].includes(status)) {
        return false
      }

      return failureCount < 2
    },
  })
}
