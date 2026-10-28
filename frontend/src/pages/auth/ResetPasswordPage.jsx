import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { resetPassword } from '../../services/auth.service'
import { useAuthStore } from '../../stores/authStore'

function ResetPasswordContent({ location }) {
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get('token') || '')
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const validToken = /^[a-f0-9]{64}$/.test(token)
  useEffect(() => {
    if (location.hash) window.history.replaceState(window.history.state, '', window.location.pathname)
  }, [location.hash])
  const submit = async (event) => {
    event.preventDefault()
    if (!validToken || pending || success) return
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    if (values.password !== values.confirmPassword) { setError('Konfirmasi password tidak cocok.'); return }
    if (new TextEncoder().encode(values.password).length > 72) { setError('Password terlalu panjang. Gunakan password yang lebih pendek.'); return }
    const sessionId = useAuthStore.getState().sessionId
    setPending(true)
    setError('')
    try {
      const result = await resetPassword({ token, ...values })
      form.reset()
      setSuccess(true)
      // Invalidate only the account that was reset, not another account opened in this browser.
      if (useAuthStore.getState().user?.id === result.data?.userId) {
        try { useAuthStore.getState().logout(sessionId) } catch { /* Server already revoked the session. */ }
      }
    } catch (failure) {
      const data = failure.response?.data
      setError(data?.errors?.[0]?.field ? data.errors.map((item) => item.message).join(' ') :
        data?.message || 'Reset belum berhasil. Silakan coba lagi atau minta tautan baru.')
    } finally { setPending(false) }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-50 p-4">
      <section className="w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        {success ? (
          <p role="status" className="text-sm text-gray-700">Password berhasil diubah dan sesi lama telah dibatalkan. Silakan masuk kembali. Jika email belum diverifikasi, selesaikan verifikasi email terlebih dahulu.</p>
        ) : !validToken ? (
          <p role="alert" className="text-sm text-red-600">Tautan reset tidak lengkap atau tidak valid. Buka kembali link email atau minta tautan baru.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-gray-600">Gunakan password baru dengan minimal 8 karakter.</p>
            {[['password', 'Password Baru'], ['confirmPassword', 'Konfirmasi Password']].map(([name, label]) => (
              <div key={name} className="space-y-1">
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
                <input id={name} name={name} type="password" autoComplete="new-password" minLength={8} maxLength={128}
                  required disabled={pending} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
              </div>
            ))}
            <Button type="submit" disabled={pending} className="w-full">{pending ? 'Menyimpan...' : 'Simpan Password Baru'}</Button>
          </form>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {!success && <Link to="/forgot-password" className="block text-center text-sm text-primary-600">Minta tautan reset baru</Link>}
        <Link to="/login" className="block text-center text-sm font-semibold text-primary-600">Kembali ke Login</Link>
        {success && <Link to="/verify-email" className="block text-center text-sm text-primary-600">Kirim ulang verifikasi email</Link>}
      </section>
    </main>
  )
}
function ResetPasswordPage() {
  const location = useLocation()
  return <ResetPasswordContent key={location.hash || 'missing'} location={location} />
}
export default ResetPasswordPage
