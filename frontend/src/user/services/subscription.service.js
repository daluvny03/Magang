import api from '../../services/api'

export const getUserSubscription = async () => {
  const response = await api.get('/user/subscription')

  return response.data
}