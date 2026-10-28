import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { forgotPassword } from '../../services/auth.service'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [wait, setWait] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (wait <= 0) return
    const timer = setTimeout(() => setWait((value) => Math.max(0, value - 1)), 1000)
    return () => clearTimeout(timer)
  }, [wait])
  const submit = async (event) => {
    event.preventDefault()
    if (pending || wait) return
    setPending(true)
    setError('')
    setMessage('')
    try {
      const result = await forgotPassword(email)
      setMessage(result.message)
      setWait(60)
    } catch (failure) {
      if (failure.response?.status === 429) setWait(Number(failure.response.headers['retry-after']) || 60)
      setError(failure.response?.data?.message || 'Belum dapat meminta reset password. Silakan coba kembali.')
    } finally { setPending(false) }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-50 p-4">
      <section className="w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
        <p className="text-sm text-gray-600">Masukkan email akun Anda. Tautan reset berlaku 30 menit.</p>
        <form onSubmit={submit} className="space-y-4">
          <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="reset-email" type="email" required autoComplete="email" maxLength={255}
            value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending}
            className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          <Button type="submit" disabled={pending || wait > 0} className="w-full">
            {pending ? 'Memproses...' : wait > 0 ? `Coba lagi dalam ${wait} detik` : 'Kirim Tautan Reset'}
          </Button>
        </form>
        {message && <p role="status" className="text-sm text-gray-700">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Link to="/login" className="block text-center text-sm font-semibold text-primary-600">Kembali ke Login</Link>
      </section>
    </main>
  )
}
export default ForgotPasswordPage
