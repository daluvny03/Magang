
import api from '../../services/api'

export const createPremiumCheckout = async () => {
  const response = await api.post('/user/payments/checkout', {})

  return response.data
}

export const getPaymentDetail = async (paymentId, { signal } = {}) => {
  const response = await api.get(`/user/payments/${paymentId}`, { signal })

  return response.data
}
