import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import Button from '../../components/ui/Button'
import { login } from '../../services/auth.service'
import { useAuthStore } from '../../stores/authStore'
import characterImage from '../../assets/login-character.png'

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

// Ubah ke false untuk menyembunyikan elemen yang belum punya fitur backend
// (Ingat Saya, Lupa Password, Google, Daftar)
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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" />
    </svg>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginStore = useAuthStore((state) => state.login)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    try {
      const response = await login(values)

      if (!response.success) {
        toast.error(response.message || 'Login gagal')
        return
      }

      const { accessToken, user } = response.data
      loginStore({ accessToken, user })
      toast.success('Login berhasil')
      const defaultDestination =
        user.role === 'admin'
          ? '/admin/dashboard'
          : '/user/dashboard'

      const fromPath = location.state?.from?.pathname

      const canRedirectToFrom =
        (user.role === 'admin' && fromPath?.startsWith('/admin')) ||
        (user.role === 'user' && fromPath?.startsWith('/user'))

      const destination = canRedirectToFrom
        ? fromPath
        : defaultDestination

      navigate(destination, { replace: true })
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Terjadi kesalahan saat login'
      )
    }
  }

  const notAvailable = () => toast.info('Fitur ini belum tersedia')

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

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
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
                <button
                  type="button"
                  onClick={notAvailable}
                  className="underline underline-offset-2 hover:text-primary-700"
                >
                  Lupa Password
                </button>
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

          {SHOW_EXTRAS && (
            <>
              <button
                type="button"
                onClick={notAvailable}
                className="mt-3 flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-primary-50 text-sm text-gray-800 transition hover:bg-primary-100"
              >
                <GoogleIcon />
                Masuk dengan Akun Google
              </button>

              <p className="mt-6 text-center text-xs text-gray-500">
                Kamu belum punya akun?{' '}
                <button
                  type="button"
                  onClick={notAvailable}
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