import { KeyRound, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'

import Button from '../ui/Button'

function AdminSecurityCard({ onLogout }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Keamanan akun</h2>
        <p className="mt-1 text-sm text-gray-500">Kelola akses akun administrator dengan aman.</p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <KeyRound className="mt-0.5 shrink-0 text-primary-600" size={20} aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Reset kata sandi</h3>
              <p className="mt-1 text-sm text-gray-500">Kami akan mengirimkan tautan penggantian kata sandi ke email Anda.</p>
            </div>
          </div>
          <Link to="/forgot-password" className="shrink-0 text-sm font-semibold text-primary-600 hover:text-primary-700">
            Reset password
          </Link>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Keluar dari aplikasi</h3>
            <p className="mt-1 text-sm text-gray-500">Akhiri sesi akun administrator pada perangkat ini.</p>
          </div>
          <Button type="button" variant="outline" onClick={onLogout} className="shrink-0">
            <LogOut size={16} aria-hidden="true" />
            Logout
          </Button>
        </div>
      </div>
    </section>
  )
}

export default AdminSecurityCard
