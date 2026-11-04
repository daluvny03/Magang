
import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../stores/authStore'

import {
    getLearningRecommendations,
} from '../services/learning-recommendation.service'

export const useLearningRecommendations = () => {
    const userId = useAuthStore(
        (state) => state.user?.id
    )

    return useQuery({
        queryKey: [
            'user',
            userId,
            'learning-recommendations',
        ],

        queryFn: ({ signal }) =>
            getLearningRecommendations({ signal }),

        enabled: Boolean(userId),

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
