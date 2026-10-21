
import api from '../../services/api'

export const getSubscriptionCatalog = async () => {
  const response = await api.get('/user/subscription/catalog')

  return response.data
}

export const getActiveSubscription = async ({ signal } = {}) => {
  const response = await api.get('/user/subscription', { signal })

  return response.data
}
