import {
    useMutation,
} from '@tanstack/react-query'

import {
    updateDoubtfulStatus,
} from '../services/cat.service'

export const useUpdateDoubtful = () => {
    return useMutation({
        mutationFn:
            updateDoubtfulStatus,
    })
}