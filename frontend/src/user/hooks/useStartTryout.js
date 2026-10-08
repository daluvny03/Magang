import { useMutation } from '@tanstack/react-query'
import { startUserTryout } from '../services/tryout.service'

export const useStartTryout = () => {
  return useMutation({
    mutationFn: startUserTryout,
  })
}