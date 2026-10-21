
import {
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'

import {
  createPremiumCheckout,
  getPaymentDetail,
} from '../services/payment.service'

export const useCreatePremiumCheckout = () => {
  return useMutation({
    mutationFn: createPremiumCheckout,
  })
}

export const usePaymentDetail = (paymentId) => {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: ['user-payment', userId, paymentId],
    queryFn: ({ signal }) => getPaymentDetail(paymentId, { signal }),
    enabled: Boolean(userId && paymentId),
    refetchOnWindowFocus: true,

    refetchInterval: (query) => {
      if (!paymentId) return false

      const payment = query.state.data?.data

      if (!payment) return 10000

      if (payment.appliedAt) return false

      if (
        payment.status === 'initiating' ||
        payment.status === 'reconciling' ||
        payment.status === 'pending' ||
        payment.status === 'paid'
      ) {
        return 10000
      }

      return false
    },
  })
}

