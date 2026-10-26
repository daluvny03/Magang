
import api from '../../services/api'

export const createPremiumCheckout = async () => {
  const response = await api.post('/user/payments/checkout', {})

  return response.data
}

export const getPaymentDetail = async (paymentId, { signal } = {}) => {
  const response = await api.get(`/user/payments/${paymentId}`, { signal })

  return response.data
}

export const getPaymentHistory = async (
  { page = 1, limit = 10, signal } = {}
) => {
  const response = await api.get(
    '/user/payments/history',
    {
      params: { page, limit },
      signal,
    }
  )

  return response.data.data
}