import { RefreshCw } from 'lucide-react'

import LoadingSpinner from '../../components/common/LoadingSpinner'
import Button from '../../components/ui/Button'
import AdminAccountCard from '../../components/settings/AdminAccountCard'
import AdminAccountDetails from '../../components/settings/AdminAccountDetails'
import AdminSecurityCard from '../../components/settings/AdminSecurityCard'
import { useAdminProfile } from '../../hooks/useAdminProfile'
import { useAuthStore } from '../../stores/authStore'

function SettingsPage() {
  const logout = useAuthStore((state) => state.logout)
  const { data: response, isLoading, isError, isFetching, refetch } = useAdminProfile()
  const profile = response?.data?.user

  if (isLoading && !profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-red-100 bg-red-50 p-5">
        <h1 className="text-lg font-bold text-red-900">Informasi akun tidak dapat dimuat</h1>
        <p className="mt-1 text-sm text-red-700">{response?.message || 'Silakan coba kembali dalam beberapa saat.'}</p>
        <Button type="button" variant="outline" onClick={() => refetch()} className="mt-4">Coba lagi</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Pengaturan</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Informasi akun</h1>
          <p className="mt-2 text-sm text-gray-500">Tinjau informasi dan keamanan akun administrator Anda.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} aria-hidden="true" />
          {isFetching ? 'Memperbarui…' : 'Perbarui data'}
        </Button>
      </header>

      <AdminAccountCard profile={profile} />
      <AdminAccountDetails profile={profile} />
      <AdminSecurityCard onLogout={logout} />
    </div>
  )
}

export default SettingsPage
