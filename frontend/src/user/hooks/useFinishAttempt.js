import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '../../stores/authStore'
import { finishAttempt } from '../services/cat.service'

export const useFinishAttempt = () => {
    const queryClient = useQueryClient()
    const userId = useAuthStore((state) => state.user?.id)

    return useMutation({
        mutationFn: finishAttempt,
        retry: false,
        onSuccess: () => {
            // Hanya kunci yang tidak dipakai halaman ujian. Menyegarkan kunci sesi
            // ujian akan memicu 409 ATTEMPT_COMPLETED sebelum berpindah ke hasil.
            const staleKeys = [
                ['user', userId, 'attempt-statistics'],
                ['user', userId, 'latest-attempt'],
                ['user', userId, 'attempt-history'],
                ['user-tryouts'],
                ['user-tryout-detail'],
            ]

            staleKeys.forEach((queryKey) => {
                queryClient.invalidateQueries({ queryKey })
            })
        },
    })
}