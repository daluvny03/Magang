import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { registerAccount } from '../../services/auth.service'
import { toast } from 'sonner'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import { loginWithGoogle } from '../../services/auth.service'
import { useAuthStore } from '../../stores/authStore'

function RegisterPage() {
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const loginStore = useAuthStore((state) => state.login)
  const [googlePending, setGooglePending] = useState(false)
  const authLockRef = useRef(false)

  const submit = async (event) => {
    event.preventDefault()
    if (authLockRef.current) return
    const values = Object.fromEntries(
      new FormData(event.currentTarget)
    )
    if (values.password !== values.confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }
    authLockRef.current = true
    setPending(true)
    setError('')
    try {
      await registerAccount({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      navigate('/verify-email', {
        replace: true,
        state: {
          email: values.email,
          registered: true,
        },
      })
    } catch (failure) {
      const data = failure.response?.data
      setError(
        data?.errors?.[0]?.field
          ? data.errors.map((item) => item.message).join(' ')
          : data?.message ||
          'Registrasi belum berhasil. Silakan coba kembali.'
      )
    } finally {
      authLockRef.current = false
      setPending(false)
    }
  }
  const handleGoogleRegister = async (credential) => {
    if (authLockRef.current) return
    authLockRef.current = true
    setGooglePending(true)

    try {
      const response = await loginWithGoogle(credential)

      if (!response.success) {
        toast.error(response.message || 'Registrasi Google gagal')
        return
      }

      const { user, accessToken } = response.data

      if (!user || !accessToken) {
        toast.error('Respons autentikasi Google tidak valid')
        return
      }

      loginStore({ user, accessToken })

      toast.success('Berhasil masuk menggunakan Google')

      navigate(
        user.role === 'admin'
          ? '/admin/dashboard'
          : '/user/dashboard',
        { replace: true }
      )
    } catch (error) {
      if (error.code === 'ERR_CANCELED') return
      const errorCode =
        error.response?.data?.errors?.[0]?.code
      if (errorCode === 'GOOGLE_ACCOUNT_LINK_REQUIRED') {
        toast.error(
          'Email sudah terdaftar. Masuk menggunakan password terlebih dahulu.'
        )
        return
      }
      if (errorCode === 'GOOGLE_EMAIL_VERIFICATION_REQUIRED') {
        toast.error(
          'Email memerlukan verifikasi tambahan. Gunakan pendaftaran manual terlebih dahulu.'
        )
        return
      }
      if (errorCode === 'ACCOUNT_UNAVAILABLE') {
        toast.error('Akun tidak tersedia atau telah dinonaktifkan.')
        return
      }
      toast.error(
        error.response?.data?.message ||
        'Terjadi kesalahan saat mendaftar dengan Google'
      )
    } finally {
      authLockRef.current = false
      setGooglePending(false)
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-50 p-4">
      <section className="w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Buat Akun</h1>
        <p className="text-sm text-gray-600">Verifikasi email Anda setelah mendaftar untuk mulai menggunakan Halobakat.</p>
        <form onSubmit={submit} className="space-y-4">
          {[
            { name: 'name', label: 'Nama', type: 'text', autoComplete: 'name', minLength: 2, maxLength: 100 },
            { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', maxLength: 255 },
            { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password', minLength: 8, maxLength: 128 },
            { name: 'confirmPassword', label: 'Konfirmasi Password', type: 'password', autoComplete: 'new-password', minLength: 8, maxLength: 128 },
          ].map(({ label, ...field }) => (
            <div key={field.name} className="space-y-1">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{label}</label>
              <input {...field} id={field.name} required disabled={pending} className="w-full rounded-lg border border-gray-300 px-3 py-2" />
            </div>
          ))}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={pending} className="w-full">{pending ? 'Mendaftarkan...' : 'Daftar'}</Button>
        </form>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">atau</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="flex justify-center">
          <GoogleSignInButton
            onCredential={handleGoogleRegister}
            onError={(message) => toast.error(message)}
            disabled={googlePending || pending}
            text="signup_with"
          />
        </div>
        <Link to="/login" className="block text-center text-sm text-primary-600">Sudah punya akun? Masuk</Link>
        <Link to="/verify-email" className="block text-center text-sm text-primary-600">Kirim ulang email verifikasi</Link>
      </section>
    </main>
  )
}
export default RegisterPage
