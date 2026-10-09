import { useMutation } from '@tanstack/react-query'

import {
    saveQuestionProgress,
} from '../services/cat.service'

export const useSaveQuestionProgress = () => {
    return useMutation({
        mutationFn: saveQuestionProgress,
    })
}