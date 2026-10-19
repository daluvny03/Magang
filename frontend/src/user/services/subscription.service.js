
import api from '../../services/api'

export const getSubscriptionCatalog = async () => {
  const response = await api.get('/user/subscription/catalog')

  return response.data
}

export const getActiveSubscription = async () => {
  const response = await api.get('/user/subscription')

  return response.data
}
