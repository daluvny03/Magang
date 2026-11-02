import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import { loginWithGoogle, registerAccount } from '../../services/auth.service'
import { useAuthStore } from '../../stores/authStore'
import { applyFieldErrors, normalizeServerErrors } from '../../utils/normalizeServerErrors'
import { getPostLoginPath } from '../../utils/getPostLoginPath'

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter'),
    email: z
      .string()
      .trim()
      .min(1, 'Email wajib diisi')
      .email('Email tidak valid')
      .max(255, 'Email maksimal 255 karakter'),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .max(128, 'Password maksimal 128 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi password tidak cocok.',
  })

const REGISTER_FIELDS = [
  { name: 'name', label: 'Nama', type: 'text', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Konfirmasi Password', type: 'password', autoComplete: 'new-password' },
]

const FIELD_NAMES = REGISTER_FIELDS.map((field) => field.name)

function RegisterPage() {
  const navigate = useNavigate()
  const loginStore = useAuthStore((state) => state.login)
  const [serverError, setServerError] = useState('')
  const [googlePending, setGooglePending] = useState(false)
  const authLockRef = useRef(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values) => {
    if (authLockRef.current) return
    authLockRef.current = true
    setServerError('')

    try {
      await registerAccount({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      navigate('/verify-email', {
        replace: true,
        state: { email: values.email, registered: true },
      })
    } catch (failure) {
      const { message, fieldErrors } = normalizeServerErrors(
        failure,
        'Registrasi belum berhasil. Silakan coba kembali.'
      )

      if (!applyFieldErrors(fieldErrors, setError, FIELD_NAMES)) {
        setServerError(message)
      }
    } finally {
      authLockRef.current = false
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

      navigate(getPostLoginPath(user.role), { replace: true })
    } catch (error) {
      if (error.code === 'ERR_CANCELED') return

      const { message, codes } = normalizeServerErrors(
        error,
        'Terjadi kesalahan saat mendaftar dengan Google'
      )

      if (codes.includes('GOOGLE_ACCOUNT_LINK_REQUIRED')) {
        toast.error(
          'Email sudah terdaftar. Masuk menggunakan password terlebih dahulu.'
        )
        return
      }

      if (codes.includes('GOOGLE_EMAIL_VERIFICATION_REQUIRED')) {
        toast.error(
          'Email memerlukan verifikasi tambahan. Gunakan pendaftaran manual terlebih dahulu.'
        )
        return
      }

      if (codes.includes('ACCOUNT_UNAVAILABLE')) {
        toast.error('Akun tidak tersedia atau telah dinonaktifkan.')
        return
      }

      toast.error(message)
    } finally {
      authLockRef.current = false
      setGooglePending(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary-50 p-4">
      <section className="w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Buat Akun</h1>
        <p className="text-sm text-gray-600">
          Verifikasi email Anda setelah mendaftar untuk mulai menggunakan Halobakat.
        </p>

        <form
          noValidate
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event)
          }}
          className="space-y-4"
        >
          {REGISTER_FIELDS.map(({ name, label, type, autoComplete }) => {
            const fieldError = errors[name]

            return (
              <div key={name} className="space-y-1">
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                  {label}
                </label>

                <input
                  id={name}
                  type={type}
                  autoComplete={autoComplete}
                  disabled={isSubmitting}
                  aria-invalid={fieldError ? 'true' : undefined}
                  aria-describedby={fieldError ? `${name}-error` : undefined}
                  className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
                    fieldError
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/30'
                  }`}
                  {...register(name)}
                />

                {fieldError && (
                  <p id={`${name}-error`} className="text-xs text-red-600">
                    {fieldError.message}
                  </p>
                )}
              </div>
            )
          })}

          {serverError && (
            <p role="alert" className="text-sm text-red-600">
              {serverError}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting || googlePending} className="w-full">
            {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
          </Button>
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
            disabled={googlePending || isSubmitting}
            text="signup_with"
          />
        </div>

        <Link to="/login" className="block text-center text-sm text-primary-600">
          Sudah punya akun? Masuk
        </Link>
        <Link to="/verify-email" className="block text-center text-sm text-primary-600">
          Kirim ulang email verifikasi
        </Link>
      </section>
    </main>
  )
}

export default RegisterPage