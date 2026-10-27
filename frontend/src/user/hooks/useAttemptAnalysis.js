
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

    queryFn: ({ signal }) =>
      getAttemptAnalysis(attemptId, { signal }),

    enabled:
      Boolean(userId) &&
      /^[1-9]\d*$/.test(String(attemptId ?? '')),

    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,

    retry: (failureCount, error) => {
      const status = error?.response?.status

      if ([400, 401, 403, 404, 409, 422].includes(status)) {
        return false
      }

      return failureCount < 2
    },
  })
}
