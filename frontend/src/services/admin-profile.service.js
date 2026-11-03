import api from './api'

export const getAdminProfile = async ({ signal } = {}) => {
  const response = await api.get('/auth/me', { signal })

  return response.data
}
