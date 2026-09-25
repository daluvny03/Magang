import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { login } from '../../services/auth.service'
import { useAuthStore } from '../../stores/authStore'

const loginSchema = z.object({
  email: z
    .string()
    .email('Email tidak valid')
    .min(1, 'Email wajib diisi'),

  password: z
    .string()
    .min(1, 'Password wajib diisi'),
})

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const loginStore = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      const response = await login(values)

      if (!response.success) {
        toast.error(response.message || 'Login gagal')
        return
      }

      const { token, user } = response.data

      loginStore({
        token,
        user,
      })

      toast.success('Login berhasil')

      const destination =
        location.state?.from?.pathname || '/admin/dashboard'

      navigate(destination, { replace: true })
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Terjadi kesalahan saat login'

      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Masuk ke Admin Dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-900"
              placeholder="admin@example.com"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-gray-900"
              placeholder="••••••••"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage