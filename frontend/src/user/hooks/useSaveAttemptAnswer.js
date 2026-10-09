import { useMutation } from '@tanstack/react-query'

import {
    saveAttemptAnswer,
} from '../services/cat.service'

export const useSaveAttemptAnswer = () => {
    return useMutation({
        mutationFn: saveAttemptAnswer,
    })
}