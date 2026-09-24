import { BrowserRouter, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/user/HomePage'
import DashboardPage from '../pages/admin/DashboardPage'
import HealthPage from '../pages/user/healthPage'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />

                <Route
                    path="/admin/dashboard"
                    element={<DashboardPage />}
                />
                <Route
                    path="/health"
                    element={<HealthPage />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter