import api from '../../services/api'

export const getUserProfile = async ({ signal } = {}) => {
  const response = await api.get('/user/profile', { signal })

  return response.data
}
