import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })
const staleSessionError = () => new axios.CanceledError('Session changed; request ignored')

api.interceptors.request.use((config) => {
  const previousId = useAuthStore.getState().sessionId
  let session
  try { session = useAuthStore.getState().syncFromStorage() } catch {
    throw staleSessionError()
  }
  // Batalkan tindakan yang dimulai UI lama sebelum tab menerima storage event.
  if (session.sessionId !== previousId) throw staleSessionError()
  config.sessionId = session.sessionId
  config.skipSessionAuth = config.url === '/auth/login' || config.url === '/auth/register'
  if (!config.skipSessionAuth && session.accessToken) {
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
    if (error.response?.status === 401 && !error.config.skipSessionAuth) {
      try { useAuthStore.getState().logout(error.config.sessionId) } catch {
        return Promise.reject(staleSessionError())
      }
    }
    return Promise.reject(error)
  },
)

export default api
