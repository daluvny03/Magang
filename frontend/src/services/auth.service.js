import api from './api'
import { useAuthStore } from '../stores/authStore'

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials)

  return response.data
}

export const logout = () => {
  useAuthStore.getState().logout()
}

export const registerAccount = async (values) => (await api.post('/auth/register', values)).data
export const verifyEmail = async (token) => (await api.post('/auth/verify-email', { token })).data
export const resendVerification = async (email) => (await api.post('/auth/resend-verification', { email })).data

export const forgotPassword = async (email) => (await api.post('/auth/forgot-password', { email })).data
export const resetPassword = async (values) => (await api.post('/auth/reset-password', values)).data

export const loginWithGoogle = async (credential) => {
  const response = await api.post('/auth/google', {
    credential,
  })

  return response.data
}
