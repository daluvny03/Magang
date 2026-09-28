import { create } from 'zustand'

const getStoredUser = () => {
  const user = localStorage.getItem('user')

  try {
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('accessToken'),
  user: getStoredUser(),
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: ({ accessToken, user }) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))

    set({
      accessToken,
      user,
      isAuthenticated: true,
    })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  },
}))

window.addEventListener('auth:logout', () => {
  useAuthStore.getState().logout()
})