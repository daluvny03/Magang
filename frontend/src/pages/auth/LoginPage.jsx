import { useState, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import Button from '../../components/ui/Button'
import { login, loginWithGoogle } from '../../services/auth.service'
import { useAuthStore } from '../../stores/authStore'
import characterImage from '../../assets/login-character.png'

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

// Ubah ke false untuk menyembunyikan elemen yang belum punya fitur backend
// (Ingat Saya dan Google belum tersedia)
const SHOW_EXTRAS = true

const backgroundStyle = {
  backgroundColor: '#2f8d8f', // dasar teal gelap (sisi kanan)
  backgroundRepeat: 'no-repeat',
  backgroundImage: [
    // cahaya terang pojok kiri atas
    'radial-gradient(ellipse 60% 50% at 0% 0%, #60deea 0%, rgba(86,199,209,0) 100%)',
    // pita terang di belakang kartu
    'radial-gradient(ellipse 28% 70% at 35% 55%, #48aeb7 0%, rgba(79,189,199,0) 100%)',
    // sorotan di belakang karakter
    'radial-gradient(ellipse 28% 38% at 82% 85%, #50c8d2 0%, rgba(73,185,195,0) 100%)',
    // area redup di kiri bawah
    'radial-gradient(ellipse 35% 30% at 10% 100%, #58a9ac 0%, rgba(88,169,172,0) 100%)',
  ].join(','),
}
const inputClass =
  'h-10 w-full rounded-xl border bg-primary-50 px-3.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2'

const inputState = (error) =>
  error
    ? 'border-red-400 focus:ring-red-200'
    : 'border-transparent focus:border-primary-500 focus:ring-primary-500/30'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginStore = useAuthStore((state) => state.login)
  const [showPassword, setShowPassword] = useState(false)
  const [googlePending, setGooglePending] = useState(false)
  const authLockRef = useRef(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    if (authLockRef.current) return
    authLockRef.current = true
    try {
      const response = await login(values)

      if (!response.success) {
        toast.error(response.message || 'Login gagal')
        return
      }

      const { accessToken, user } = response.data
      if (
        typeof accessToken !== 'string' ||
        !accessToken ||
        !user?.id ||
        !['admin', 'user'].includes(user.role)
      ) {
        toast.error('Respons login tidak valid')
        return
      }
      loginStore({ accessToken, user })
      toast.success('Login berhasil')
      const defaultDestination =
        user.role === 'admin'
          ? '/admin/dashboard'
          : '/user/dashboard'

      const fromPath = location.state?.from?.pathname

      const canRedirectToFrom =
        typeof fromPath === 'string' &&
        (
          (
            user.role === 'admin' &&
            (fromPath === '/admin' || fromPath.startsWith('/admin/'))
          ) ||
          (
            user.role === 'user' &&
            (fromPath === '/user' || fromPath.startsWith('/user/'))
          )
        )

      const destination = canRedirectToFrom
        ? fromPath
        : defaultDestination

      navigate(destination, { replace: true })
    } catch (error) {
      if (error.response?.data?.errors?.some((item) => item.code === 'EMAIL_NOT_VERIFIED')) {
        navigate('/verify-email', { state: { email: values.email } })
        return
      }
      toast.error(
        error.response?.data?.message || 'Terjadi kesalahan saat login'
      )
    } finally {
      authLockRef.current = false
    }
  }

  const onGoogleCredential = async (credential) => {
    if (authLockRef.current) return
    authLockRef.current = true
    setGooglePending(true)
    try {
      const response = await loginWithGoogle(credential)

      if (!response.success) {
        toast.error(response.message || 'Login Google gagal')
        return
      }

      const { user, accessToken } = response.data
      if (
        typeof accessToken !== 'string' ||
        !accessToken ||
        !user?.id ||
        !['admin', 'user'].includes(user.role)
      ) {
        toast.error('Respons autentikasi Google tidak valid')
        return
      }
      loginStore({ user, accessToken })

      toast.success('Login dengan Google berhasil')

      const defaultDestination =
        user.role === 'admin'
          ? '/admin/dashboard'
          : '/user/dashboard'

      const fromPath = location.state?.from?.pathname

      const canRedirectToFrom =
        typeof fromPath === 'string' &&
        (
          (
            user.role === 'admin' &&
            (fromPath === '/admin' || fromPath.startsWith('/admin/'))
          ) ||
          (
            user.role === 'user' &&
            (fromPath === '/user' || fromPath.startsWith('/user/'))
          )
        )

      navigate(
        canRedirectToFrom ? fromPath : defaultDestination,
        { replace: true }
      )
    } catch (error) {
      const errorCode = error.response?.data?.errors?.[0]?.code

      if (errorCode === 'GOOGLE_ACCOUNT_LINK_REQUIRED') {
        toast.error(
          'Email sudah terdaftar. Masuk menggunakan password terlebih dahulu.'
        )
        return
      }

      if (errorCode === 'GOOGLE_EMAIL_VERIFICATION_REQUIRED') {
        toast.error(
          'Alamat email Google memerlukan verifikasi tambahan.'
        )
        return
      }

      if (error.code === 'ERR_CANCELED') return

      toast.error(
        error.response?.data?.message ||
        'Terjadi kesalahan saat login dengan Google'
      )
    } finally {
      setGooglePending(false)
      authLockRef.current = false
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center px-4 py-10"
      style={backgroundStyle}
    >
      <h1 className="text-center text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
        Halo, Selamat datang kembali di Halobakat.
      </h1>

      <div className="flex w-full max-w-6xl flex-1 items-center justify-center gap-10 py-10 lg:justify-between">
        {/* Kartu login */}
        <div className="w-full max-w-[440px] rounded-3xl bg-white p-8 shadow-xl sm:p-10">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Masuk ke Akunmu
          </h2>

          <form
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event)
            }}
            className="mt-7 space-y-4"
          >
            <div>
              <input
                type="email"
                autoComplete="email"
                placeholder="Alamat Email"
                aria-label="Alamat Email"
                className={`${inputClass} ${inputState(errors.email)}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password"
                  aria-label="Password"
                  className={`${inputClass} pr-10 ${inputState(errors.password)}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-primary-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {SHOW_EXTRAS && (
              <div className="flex items-center justify-between px-1 text-xs text-primary-600">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-primary-500"
                  />
                  Ingat Saya
                </label>
                <Link to="/forgot-password" className="underline underline-offset-2 hover:text-primary-700">
                  Lupa Password
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
          <Link to="/verify-email" className="mt-3 block text-center text-xs text-primary-600 hover:underline">
            Belum menerima email verifikasi?
          </Link>

          {SHOW_EXTRAS && (
            <>
              <div className="mt-4">
                <GoogleSignInButton
                  onCredential={onGoogleCredential}
                  onError={(message) => toast.error(message)}
                  disabled={googlePending || isSubmitting}
                  text="signin_with"
                />
              </div>

              <p className="mt-6 text-center text-xs text-gray-500">
                Kamu belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  Daftar disini ya!
                </button>
              </p>
            </>
          )}
        </div>

        {/* Karakter (disembunyikan di layar kecil) */}
        <img
          src={characterImage}
          alt=""
          className="hidden max-h-[480px] w-auto object-contain lg:block"
        />
      </div>
    </div>
  )
}

export default LoginPage