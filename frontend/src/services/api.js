import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })
const staleSessionError = () => new axios.CanceledError('Session changed; request ignored')
const SESSION_INVALID_CODES = new Set([
  'INVALID_TOKEN',
  'SESSION_INVALID',
  'AUTH_TOKEN_REQUIRED',
  'INVALID_AUTH_HEADER',
])
api.interceptors.request.use((config) => {
  const previousId = useAuthStore.getState().sessionId
  let session
  try { session = useAuthStore.getState().syncFromStorage() } catch {
    throw staleSessionError()
  }
  // Batalkan tindakan yang dimulai UI lama sebelum tab menerima storage event.
  if (session.sessionId !== previousId) throw staleSessionError()
  config.sessionId = session.sessionId
  config.skipSessionAuth = ['/auth/login', '/auth/register', '/auth/verify-email', '/auth/resend-verification', '/auth/forgot-password', '/auth/reset-password', '/auth/google'].includes(config.url)
  if (config.skipSessionAuth) {
    delete config.headers.Authorization
  } else if (session.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
}, (error) => { throw error }, { synchronous: true })

const isCurrentSession = (config) => {
  if (!config || !Object.hasOwn(config, 'sessionId')) return false
  try {
    return useAuthStore.getState().syncFromStorage().sessionId === config.sessionId
  } catch {
    return false
  }
}

api.interceptors.response.use(
  (response) => {
    if (!isCurrentSession(response.config)) throw staleSessionError()
    return response
  },
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)
    if (!isCurrentSession(error.config)) return Promise.reject(staleSessionError())
    const errorCodes = error.response?.data?.errors
    ?.map((item) => item.code) ?? []

  const sessionInvalid =
    error.response?.status === 401 &&
    !error.config.skipSessionAuth &&
    errorCodes.some((code) => SESSION_INVALID_CODES.has(code))

  if (sessionInvalid) {
    try {
      useAuthStore.getState().logout(error.config.sessionId)
    } catch {
      return Promise.reject(staleSessionError())
    }
  }
    return Promise.reject(error)
  },
)

export default api
