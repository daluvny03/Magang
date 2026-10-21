import { useAuthStore } from '../../stores/authStore'

import { useQuery } from '@tanstack/react-query'

import {
    getAttemptResult,
} from '../services/result.service'

export const useAttemptResult = (attemptId) => {
    const userId = useAuthStore((state) => state.user?.id)
    return useQuery({
        queryKey: [
            'user-attempt-result',
            userId,
            attemptId,
        ],
        queryFn: ({ signal }) =>
            getAttemptResult(attemptId, { signal }),
        enabled: Boolean(userId) && /^[1-9]\d*$/.test(
            String(attemptId ?? '')
        ),
        retry: false,
    })
}
