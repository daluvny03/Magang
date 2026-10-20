
import {
  useMutation,
  useQuery,
} from '@tanstack/react-query'

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
  return useQuery({
    queryKey: ['user-payment', paymentId],
    queryFn: () => getPaymentDetail(paymentId),
    enabled: Boolean(paymentId),
    refetchOnWindowFocus: true,

    refetchInterval: (query) => {
      if (!paymentId) return false

      const payment = query.state.data?.data

      if (!payment) return 10000

      if (payment.appliedAt) return false

      if (
        payment.status === 'pending' ||
        payment.status === 'paid'
      ) {
        return 10000
      }

      return false
    },
  })
}

