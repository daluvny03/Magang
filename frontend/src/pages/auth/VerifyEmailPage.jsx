import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button'
import ResendVerificationForm from '../../components/auth/ResendVerificationForm'
import { verifyEmail } from '../../services/auth.service'

function VerifyEmailContent({ location }) {
  const [token] = useState(() => new URLSearchParams(location.hash.slice(1)).get('token') || '')
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const validToken = /^[a-f0-9]{64}$/.test(token)
  useEffect(() => {
    // Retain only in component memory; do not persist tokens in storage/history.
    if (location.hash) window.history.replaceState(window.history.state, '', window.location.pathname)
  }, [location.hash])
  const confirm = async () => {
    if (pending || success || !validToken) return
    setPending(true)
    setMessage('')
    try {
      const response = await verifyEmail(token)
      setMessage(response.message)
      setSuccess(true)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Verifikasi belum berhasil. Silakan coba lagi.')
    } finally { setPending(false) }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-50 p-4">
      <section className="w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Verifikasi Email</h1>
        {!success && <p className="text-sm text-gray-600">{validToken
          ? 'Konfirmasi alamat email akun Anda dengan menekan tombol berikut.'
          : location.state?.registered
            ? 'Akun berhasil dibuat. Tautan verifikasi akan dikirim ke email Anda. Periksa juga folder spam.'
            : 'Buka tautan pada email verifikasi, atau minta tautan baru di bawah.'}</p>}
        {token && !validToken && <p role="alert" className="text-sm text-red-600">Format tautan tidak valid.</p>}
        {validToken && !success && <Button onClick={confirm} disabled={pending} className="w-full">
          {pending ? 'Memverifikasi...' : 'Verifikasi Email'}
        </Button>}
        {message && <p role="status" className="text-sm text-gray-700">{message}</p>}
        {!success && <ResendVerificationForm initialEmail={location.state?.email || ''} />}
        <Link to="/login" className="block text-center text-sm font-semibold text-primary-600">Kembali ke Login</Link>
      </section>
    </main>
  )
}
function VerifyEmailPage() {
  const location = useLocation()
  return <VerifyEmailContent key={location.hash || 'resend'} location={location} />
}
export default VerifyEmailPage
