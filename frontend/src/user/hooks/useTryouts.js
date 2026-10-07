import { useQuery } from '@tanstack/react-query'

import { getUserTryouts } from '../services/tryout.service'

export const useTryouts = () => {
  return useQuery({
    queryKey: ['user-tryouts'],
    queryFn: getUserTryouts,
  })
}