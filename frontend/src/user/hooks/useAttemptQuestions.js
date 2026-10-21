import { useAuthStore } from '../../stores/authStore'
import { useQuery } from '@tanstack/react-query'

import {
    getAttemptQuestions,
} from '../services/cat.service'

export const useAttemptQuestions = (attemptId) => {
    const userId = useAuthStore((state) => state.user?.id)
    return useQuery({
        queryKey: [
            'attempt-questions',
            userId,
            String(attemptId),
        ],

        queryFn: ({ signal }) =>
            getAttemptQuestions(attemptId, { signal }),

        enabled: Boolean(userId && attemptId),

        retry: false,

        refetchOnWindowFocus: false,
    })
}
