import {
    useMutation,
} from '@tanstack/react-query'

import {
    finishAttempt,
} from '../services/cat.service'

export const useFinishAttempt = () => {
    return useMutation({
        mutationFn: finishAttempt,
        retry: false,
    })
}