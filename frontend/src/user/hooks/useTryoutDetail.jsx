import { useQuery } from '@tanstack/react-query'

import {
  getUserTryoutById
} from '../services/tryout.service'

export const useTryoutDetail = (tryoutId) => {
  return useQuery({
    queryKey: [
      'user-tryout-detail',
      String(tryoutId),
    ],
    queryFn: () =>
      getUserTryoutById(tryoutId),
    enabled: Boolean(tryoutId),
  })
}