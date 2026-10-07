import { Navigate } from 'react-router-dom'

import { useAuthStore } from '../../stores/authStore'

function RoleBasedRedirect() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  )
  const user = useAuthStore((state) => state.user)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (user?.role === 'user') {
    return <Navigate to="/user/dashboard" replace />
  }

  return <Navigate to="/403" replace />
}

export default RoleBasedRedirect