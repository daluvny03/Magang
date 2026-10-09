import { useQuery } from '@tanstack/react-query'

import {
    getAttemptQuestions,
} from '../services/cat.service'

export const useAttemptQuestions = (attemptId) => {
    return useQuery({
        queryKey: [
            'attempt-questions',
            String(attemptId),
        ],

        queryFn: () =>
            getAttemptQuestions(attemptId),

        enabled: Boolean(attemptId),

        retry: false,

        refetchOnWindowFocus: false,
    })
}