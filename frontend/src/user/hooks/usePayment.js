
import {
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'

import {
  createSubscriptionCheckout,
  getPaymentDetail,
} from '../services/payment.service'

export const useCreateSubscriptionCheckout = () => {
  return useMutation({
    mutationFn: createSubscriptionCheckout,
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
      // Subscription telah berhasil diterapkan.
      if (payment.appliedAt) return false
      // Pembayaran sudah membutuhkan penanganan operator.
      if (
        payment.applicationReviewStatus === 'needs_review' ||
        payment.applicationReviewStatus === 'resolved'
      ) {
        return false
      }
      if (
        ['initiating', 'reconciling', 'pending', 'paid']
          .includes(payment.status)
      ) {
        return 3000
      }
      return false
    },

  })
}

