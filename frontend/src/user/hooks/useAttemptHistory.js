import { useQuery } from '@tanstack/react-query'
import {
  getAttemptHistory,
} from '../services/history.service'

export const useAttemptHistory = ({
  page = 1,
  limit = 10,
} = {}) => {
  return useQuery({
    queryKey: [
      'user',
      'attempt-history',
      page,
      limit,
    ],
    queryFn: () =>
      getAttemptHistory({
        page,
        limit,
      }),
    staleTime: 30 * 1000,
  })
}
