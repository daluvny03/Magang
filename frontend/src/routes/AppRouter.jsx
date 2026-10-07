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
import CategoryPage from '../pages/admin/categories/CategoryPage'
import QuestionPage from '../pages/admin/questions/QuestionPage'
import TryoutPackagePage from '../pages/admin/tryout-packages/TryoutPackagePage'
import UserPage from '../pages/admin/users/UserPage'
import UserLayout from '../user/layouts/UserLayout'
import UserDashboardPage from '../user/pages/DashboardPage'
import RoleBasedRedirect from '../components/common/RoleBasedRedirect'

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
                        <Route
                            path="categories"
                            element={<CategoryPage />}
                        />
                        <Route
                            path="questions"
                            element={<QuestionPage />}
                        />
                        <Route
                            path="tryout-packages"
                            element={<TryoutPackagePage />}
                        />
                        <Route
                            path="users"
                            element={<UserPage />}
                        />
                    </Route>
                </Route>

                {/* User Protected */}
                <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                    <Route path="/user" element={<UserLayout />}>
                        <Route
                            index
                            element={
                                <Navigate
                                    to="/user/dashboard"
                                    replace
                                />
                            }
                        />

                        <Route
                            path="dashboard"
                            element={<UserDashboardPage />}
                        />
                    </Route>
                </Route>

                {/* Default */}
                <Route
                    path="/"
                    element={<RoleBasedRedirect />}
                />

                <Route
                    path="*"
                    element={<RoleBasedRedirect />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter