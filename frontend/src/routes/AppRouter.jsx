import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
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
import ProfilePage from '../user/pages/ProfilePage'
import RoleBasedRedirect from '../components/common/RoleBasedRedirect'
import TryoutPage from '../user/pages/TryoutPage'
import TryoutDetailPage from '../user/pages/TryoutDetailPage'
import CatExamPage from '../user/pages/CatExamPage'
import ResultPage from '../user/pages/ResultPage'
import HistoryPage from '../user/pages/HistoryPage'
import TimeAnalysisPage from '../user/pages/TimeAnalysisPage'
import SubscriptionPage from '../user/pages/SubscriptionPage'
import PaymentSuccessPage from '../user/pages/PaymentSuccesPage'
import ForbiddenPageUser from '../user/pages/ForbiddenPage'
import AnswerReviewPage from '../user/pages/AnswerReviewPage'
import LeaderboardPage from '../user/pages/LeaderboardPage'
import StatisticsPage from '../user/pages/StatisticsPage'
import PaymentHistoryPage from '../user/pages/PaymentHistoryPage'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

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

                        <Route
                            path="tryouts"
                            element={<TryoutPage />}
                        />

                        <Route
                            path="tryouts/:tryoutId"
                            element={<TryoutDetailPage />}
                        />

                        <Route
                            path="history"
                            element={<HistoryPage />}
                        />

                        <Route
                            path="results/:attemptId"
                            element={<ResultPage />}
                        />

                        <Route
                            path="results/:attemptId/analysis"
                            element={<TimeAnalysisPage />}
                        />


                        <Route
                            path="profile"
                            element={<ProfilePage />}
                        />

                        <Route
                            path="subscription"
                            element={<SubscriptionPage />}
                        />

                        <Route
                            path="/user/payment/success"
                            element={<PaymentSuccessPage />}
                        />

                        <Route
                            path="forbidden"
                            element={<ForbiddenPageUser />}
                        />

                        <Route
                            path="leaderboard"
                            element={<LeaderboardPage />}
                        />

                        <Route
                            path="statistics"
                            element={<StatisticsPage />}
                        />

                        <Route
                            path="payments"
                            element={<PaymentHistoryPage />}
                        />
                    </Route>

                    <Route
                        path="/user/results/:attemptId/answers"
                        element={<AnswerReviewPage />}
                    />

                    <Route
                        path="/user/cat/:attemptId"
                        element={<CatExamPage />}
                    />
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