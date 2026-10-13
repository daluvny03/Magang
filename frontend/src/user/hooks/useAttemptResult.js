
import { useQuery } from '@tanstack/react-query'

import {
    getAttemptResult,
} from '../services/result.service'

export const useAttemptResult = (attemptId) => {
    return useQuery({
        queryKey: [
            'user-attempt-result',
            attemptId,
        ],
        queryFn: () =>
            getAttemptResult(attemptId),
        enabled: /^[1-9]\d*$/.test(
            String(attemptId ?? '')
        ),
        retry: false,
    })
}
