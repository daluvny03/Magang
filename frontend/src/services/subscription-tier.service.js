import api from './api'

export const getSubscriptionTiers = async (params = {}) => {
  const response = await api.get('/subscription-tiers', { params })
  return response.data
}
