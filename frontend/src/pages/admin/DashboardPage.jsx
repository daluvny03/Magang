import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  Layers3,
  RefreshCw,
  Users,
} from 'lucide-react'

import { getAdminDashboard } from '../../services/admin-dashboard.service'
import SubscriptionSalesPerformance from '../../components/dashboard/SubscriptionSalesPerformance'
import PopularSubscriptionTiers from '../../components/dashboard/PopularSubscriptionTiers'
const number = new Intl.NumberFormat('id-ID')

const statuses = {
  published: {
    label: 'Publish',
    color: 'bg-emerald-50 text-emerald-700',
    bar: 'bg-emerald-500',
  },
  draft: {
    label: 'Draf',
    color: 'bg-amber-50 text-amber-700',
    bar: 'bg-amber-400',
  },
  archived: {
    label: 'Diarsipkan',
    color: 'bg-slate-100 text-slate-600',
    bar: 'bg-slate-400',
  },
}

const shortcuts = [
  {
    title: 'Kelola tryout',
    description: 'Susun paket dan atur publikasi.',
    to: '/admin/tryout-packages',
    icon: BookOpen,
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Bank soal',
    description: 'Tambah dan perbarui koleksi soal.',
    to: '/admin/questions',
    icon: FileQuestion,
    color: 'bg-sky-50 text-sky-600',
  },
  {
    title: 'Kategori',
    description: 'Rapikan pengelompokan materi.',
    to: '/admin/categories',
    icon: Layers3,
    color: 'bg-amber-50 text-amber-600',
  },
  {
    title: 'Pengguna',
    description: 'Kelola akun dan akses pengguna.',
    to: '/admin/users',
    icon: Users,
    color: 'bg-emerald-50 text-emerald-600',
  },
]

const linkFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'

function DashboardPage() {
  const {
    data,
    isPending,
    isError,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const stats = data
    ? [
      {
        ...shortcuts[0],
        label: 'Total tryout',
        value: data.tryouts.total,
        detail: `${number.format(data.tryouts.published)} publish · ${number.format(data.tryouts.draft)} draf`,
      },
      {
        ...shortcuts[1],
        label: 'Total soal',
        value: data.questions.total,
        detail: `${number.format(data.questions.active)} soal aktif`,
      },
      {
        ...shortcuts[2],
        label: 'Total kategori',
        value: data.categories.total,
        detail: `${number.format(data.categories.active)} kategori aktif`,
      },
      {
        ...shortcuts[3],
        label: 'Total pengguna',
        value: data.users.total,
        detail: `${number.format(data.users.participants)} akun peserta`,
      },
    ]
    : []

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
            Pusat pengelolaan
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Dashboard admin
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Pantau konten dan kelola kebutuhan simulasi CAT CPNS dalam satu tempat.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className={`flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 ${linkFocus}`}
        >
          <RefreshCw
            size={16}
            className={isFetching ? 'animate-spin' : ''}
          />

          {isFetching ? 'Memperbarui…' : 'Perbarui data'}
        </button>
      </header>

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {data
            ? 'Pembaruan gagal. Angka yang ditampilkan adalah data terakhir yang berhasil dimuat.'
            : 'Data dashboard belum dapat dimuat. Silakan coba kembali.'}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className={`ml-2 rounded font-semibold underline disabled:opacity-50 ${linkFocus}`}
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Loading State */}
      {isPending ? (
        <div
          role="status"
          aria-label="Memuat ringkasan dashboard"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {shortcuts.map(({ title }) => (
            <div
              key={title}
              className="h-44 animate-pulse rounded-2xl bg-gray-100 motion-reduce:animate-none"
            />
          ))}

          <span className="sr-only">
            Memuat ringkasan dashboard…
          </span>
        </div>
      ) : (
        data && (
          <>
            {/* Main Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(
                ({
                  label,
                  value,
                  detail,
                  to,
                  icon: Icon,
                  color,
                }) => (
                  <Link
                    key={label}
                    to={to}
                    className={`group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-sm ${linkFocus}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-xl p-2.5 ${color}`}>
                        <Icon size={21} aria-hidden="true" />
                      </span>

                      <ArrowRight
                        size={17}
                        className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-primary-600"
                      />
                    </div>

                    <p className="mt-5 text-sm text-gray-500">
                      {label}
                    </p>

                    <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-gray-900">
                      {number.format(value)}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      {detail}
                    </p>
                  </Link>
                )
              )}
            </div>

            {/* Subscription Sales Performance */}
            <SubscriptionSalesPerformance
              data={data.subscriptionSales}
            />

            <PopularSubscriptionTiers
              data={data.subscriptionSales}
            />

            {/* Last Updated */}
            <p className="text-xs text-gray-400" role="status">
              Pembaruan terakhir:{' '}
              {new Date(dataUpdatedAt).toLocaleTimeString('id-ID')}
            </p>
          </>
        )
      )}

      {/* Quick Navigation */}
      <section className="rounded-2xl bg-slate-50 p-5">
        <h2 className="font-semibold text-gray-900">
          Navigasi cepat
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Langsung ke ruang kerja yang Anda butuhkan.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map(
            ({
              title,
              description,
              to,
              icon: Icon,
              color,
            }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 transition hover:border-primary-300 ${linkFocus}`}
              >
                <span className={`rounded-lg p-2 ${color}`}>
                  <Icon size={18} aria-hidden="true" />
                </span>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {title}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    {description}
                  </p>
                </div>
              </Link>
            )
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
