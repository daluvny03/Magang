
import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '../../stores/authStore'
import {
  getPaymentHistory,
} from '../services/payment.service'

export const usePaymentHistory = ({
  page = 1,
  limit = 10,
} = {}) => {
  const userId = useAuthStore(
    (state) => state.user?.id
  )

  return useQuery({
    queryKey: [
      'user',
      userId,
      'payment-history',
      page,
      limit,
    ],

    queryFn: ({ signal }) =>
      getPaymentHistory({
        page,
        limit,
        signal,
      }),

    enabled: Boolean(userId),
    staleTime: 30 * 1000,

    retry: (failureCount, error) => {
      const status = error?.response?.status

      if (
        [400, 401, 403, 404, 422].includes(status)
      ) {
        return false
      }

      return failureCount < 2
    },
  })
}
