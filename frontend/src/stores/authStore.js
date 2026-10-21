import { create } from 'zustand'

const SESSION_KEY = 'cpns:session'
const emptySession = { sessionId: null, accessToken: null, user: null, isAuthenticated: false }

const parseSession = (raw) => {
  try {
    const value = JSON.parse(raw)
    if (!value?.sessionId || typeof value.accessToken !== 'string' || !value.accessToken ||
        !value.user?.id || !['user', 'admin'].includes(value.user.role)) return emptySession
    return { sessionId: value.sessionId, accessToken: value.accessToken,
      user: value.user, isAuthenticated: true }
  } catch {
    return emptySession
  }
}

const readSession = () => parseSession(localStorage.getItem(SESSION_KEY))

const initialSession = (() => {
  try {
    // Migrasikan session lama sekali; session berikutnya memakai satu write atomik.
    if (!localStorage.getItem(SESSION_KEY)) {
      const accessToken = localStorage.getItem('accessToken')
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (accessToken && user?.id) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          sessionId: crypto.randomUUID(), accessToken, user,
        }))
      }
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    return readSession()
  } catch {
    return emptySession
  }
})()

export const useAuthStore = create((set, get) => ({
  ...initialSession,
  syncFromStorage: () => {
    const session = readSession()
    if (session.sessionId !== get().sessionId) set(session)
    return session
  },
  login: ({ accessToken, user }) => {
    const session = parseSession(JSON.stringify({
      sessionId: crypto.randomUUID(), accessToken, user,
    }))
    if (!session.isAuthenticated) throw new Error('Invalid login response')
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    set(session)
  },
  logout: (expectedSessionId) => {
    const current = readSession()
    if ((typeof expectedSessionId === 'string' || expectedSessionId === null) &&
        current.sessionId !== expectedSessionId) {
      set(current)
      return
    }
    // Tombstone mencegah migrasi ulang token dari tab versi aplikasi lama.
    localStorage.setItem(SESSION_KEY, JSON.stringify(emptySession))
    set(emptySession)
  },
}))

const handleStorage = (event) => {
  if (event.key === SESSION_KEY || event.key === null) {
    try { useAuthStore.getState().syncFromStorage() } catch {
      useAuthStore.setState(emptySession)
    }
  }
}
window.addEventListener('storage', handleStorage)
if (import.meta.hot) {
  import.meta.hot.dispose(() => window.removeEventListener('storage', handleStorage))
}
