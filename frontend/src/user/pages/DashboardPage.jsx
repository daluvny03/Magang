import {
  ArrowRight,
  BookOpen,
  Clock3,
  Lock,
  Play,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../stores/authStore'
import { useTryouts } from '../hooks/useTryouts'

function DashboardPage() {
  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user)

  const {
    data: tryoutResponse,
    isLoading,
    isError,
    error,
  } = useTryouts()

  const tryouts = tryoutResponse?.data || []

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Welcome Section */}
      <section className="overflow-hidden rounded-2xl bg-primary-600 px-6 py-8 text-white lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary-100">
            Selamat datang kembali
          </p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Halo, {user?.name || 'Peserta'}!
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-primary-100 sm:text-base">
            Persiapkan dirimu menghadapi seleksi CPNS dengan
            latihan dan simulasi tryout yang tersedia.
          </p>

          <button
            type="button"
            onClick={() => navigate('/user/tryouts')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
          >
            Lihat Semua Tryout
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Tryout Section */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Tryout Untuk Kamu
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Pilih tryout dan mulai persiapanmu.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/user/tryouts')}
            className="hidden items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 sm:flex"
          >
            Lihat semua
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              {error?.response?.data?.message ||
                'Gagal memuat data tryout.'}
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !isError &&
          tryouts.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <BookOpen
                size={32}
                className="mx-auto text-gray-400"
              />

              <h3 className="mt-3 font-semibold text-gray-900">
                Belum ada tryout
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Tryout yang tersedia akan muncul di sini.
              </p>
            </div>
          )}

        {/* Tryout Cards */}
        {!isLoading &&
          !isError &&
          tryouts.length > 0 && (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tryouts.slice(0, 3).map((tryout) => (
                <article
                  key={tryout.id}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-primary-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <BookOpen size={21} />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        tryout.isFree
                          ? 'bg-green-50 text-green-700'
                          : 'bg-primary-50 text-primary-700'
                      }`}
                    >
                      {tryout.isFree
                        ? 'Gratis'
                        : 'Premium'}
                    </span>
                  </div>

                  <div className="mt-5 flex-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {tryout.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                      {tryout.description ||
                        'Latihan simulasi untuk membantu persiapan seleksi CPNS.'}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={16} />
                      {tryout.durationMinutes} menit
                    </span>

                    <span className="flex items-center gap-1.5">
                      <BookOpen size={16} />
                      {tryout.questionCount} soal
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!tryout.isAccessible}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      tryout.isAccessible
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'cursor-not-allowed bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tryout.isAccessible ? (
                      <>
                        <Play size={16} />
                        Mulai Tryout
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Terkunci
                      </>
                    )}
                  </button>
                </article>
              ))}
            </div>
          )}

        {!isLoading &&
          !isError &&
          tryouts.length > 3 && (
            <button
              type="button"
              onClick={() => navigate('/user/tryouts')}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:hidden"
            >
              Lihat Semua Tryout
              <ArrowRight size={16} />
            </button>
          )}
      </section>
    </div>
  )
}

export default DashboardPage