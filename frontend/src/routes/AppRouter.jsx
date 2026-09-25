import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import ProtectedRoute from '../components/common/ProtectedRoute'
import AdminLayout from '../layout/AdminLayout'
import ForbiddenPage from '../pages/ForbiddenPage'
import DashboardPage from '../pages/admin/DashboardPage'
import LoginPage from '../pages/auth/LoginPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/403"
          element={<ForbiddenPage />}
        />

        {/* Admin Protected */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<DashboardPage />}
            />
          </Route>
        </Route>

        {/* Default */}
        <Route
          path="/"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter