import api from './api'

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials)

  return response.data
}

export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
}