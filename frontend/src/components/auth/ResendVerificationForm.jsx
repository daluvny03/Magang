import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import { resendVerification } from '../../services/auth.service'

function ResendVerificationForm({ initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail)
  const [pending, setPending] = useState(false)
  const [wait, setWait] = useState(0)
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (wait <= 0) return
    const timer = setTimeout(() => setWait((value) => Math.max(0, value - 1)), 1000)
    return () => clearTimeout(timer)
  }, [wait])
  const submit = async (event) => {
    event.preventDefault()
    if (pending || wait) return
    setPending(true)
    setMessage('')
    try {
      const response = await resendVerification(email)
      setMessage(response.message)
      setWait(60)
    } catch (error) {
      if (error.response?.status === 429) setWait(Number(error.response.headers['retry-after']) || 60)
      setMessage(error.response?.data?.message || 'Belum dapat mengirim email. Silakan coba lagi.')
    } finally { setPending(false) }
  }
  return (
    <form onSubmit={submit} className="space-y-3 border-t border-gray-200 pt-5">
      <h2 className="font-semibold text-gray-900">Kirim ulang verifikasi</h2>
      <label htmlFor="verification-email" className="block text-sm text-gray-600">Email</label>
      <input id="verification-email" type="email" autoComplete="email" required maxLength={255}
        value={email} onChange={(event) => setEmail(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2" />
      <Button type="submit" disabled={pending || wait > 0} className="w-full">
        {pending ? 'Memproses...' : wait > 0 ? `Coba lagi dalam ${wait} detik` : 'Kirim Tautan Verifikasi'}
      </Button>
      {message && <p role="status" className="text-sm text-gray-600">{message}</p>}
    </form>
  )
}
export default ResendVerificationForm
