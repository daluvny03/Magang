import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation()

  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  if (
    allowedRoles?.length &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

export default ProtectedRoute