
import {
  AlertCircle,
  ChartNoAxesCombined,
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  RefreshCw,
  Trophy,
} from 'lucide-react'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

import { Link } from 'react-router-dom'
import { useAttemptStatistics } from '../hooks/useAttemptStatistics'

const formatPercentage = (value) => {
  if (value == null) return '-'

  const number = Number(value)

  if (!Number.isFinite(number)) return '-'

  return `${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(number)}%`
}

const metrics = [
  {
    key: 'totalAttempts',
    title: 'Tryout Selesai',
    icon: ClipboardCheck,
  },
  {
    key: 'averageScorePercentage',
    title: 'Rata-rata Pencapaian',
    icon: ChartNoAxesCombined,
    percentage: true,
  },
  {
    key: 'bestScorePercentage',
    title: 'Pencapaian Terbaik',
    icon: Trophy,
    percentage: true,
  },
  {
    key: 'passedAttempts',
    title: 'Lulus Passing Grade',
    icon: CheckCircle2,
  },
]

function StatisticsPage() {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useAttemptStatistics()

  if (isPending) {
    return (
      <div
        role="status"
        className="flex min-h-80 items-center justify-center gap-3 text-slate-500"
      >
        <LoaderCircle
          size={24}
          className="animate-spin"
        />
        Memuat statistik performa...
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
      >
        <AlertCircle
          size={32}
          className="mx-auto text-red-600"
        />

        <h1 className="mt-3 font-semibold text-red-800">
          Gagal memuat statistik
        </h1>

        <p className="mt-2 text-sm text-red-700">
          Statistik belum berhasil diambil.
          Silakan coba kembali.
        </p>

        {import.meta.env.DEV && (
          <p className="mt-2 text-xs text-red-600">
            {error?.message}
          </p>
        )}

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </div>
    )
  }

  const summary = data?.summary ?? {}
  const trend = data?.trend ?? []

  const hasAttempts =
    Number(summary.totalAttempts ?? 0) > 0

  const chartData = trend
    .filter((item) => (
      item.scorePercentage != null &&
      Number.isFinite(Number(item.scorePercentage))
    ))
    .map((item, index) => ({
      attemptId: item.attemptId,
      name: `#${index + 1}`,
      tryoutName: item.tryoutName,
      scorePercentage: Number(
        item.scorePercentage
      ),
      completedAt: item.completedAt,
    }))

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <ChartNoAxesCombined size={18} />
          Analisis Performa
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Statistik Performa
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Pantau perkembangan skor dan hasil simulasi CAT CPNS.
        </p>
      </header>

      {!hasAttempts ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <ClipboardCheck
            size={36}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Belum ada statistik
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Selesaikan tryout pertamamu untuk
            mulai melihat perkembangan performa.
          </p>

          <Link
            to="/user/tryouts"
            className="mt-5 inline-flex rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Jelajahi Tryout
          </Link>
        </section>
      ) : (
        <>
          {/* Summary cards */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon
              const value = summary[metric.key]

              return (
                <article
                  key={metric.key}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <Icon size={22} />
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    {metric.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {metric.percentage
                      ? formatPercentage(value)
                      : Number(value ?? 0)}
                  </p>
                </article>
              )
            })}
          </section>

          {/* Performance trend */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Tren Pencapaian Skor
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Maksimal 20 tryout terbaru, diurutkan dari
              pengerjaan paling lama ke terbaru.
            </p>

            {chartData.length >= 2 ? (
              <div className="mt-6 h-80 w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 16,
                      left: -16,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        `${value}%`
                      }
                      domain={[
                        (dataMin) =>
                          Math.min(0, dataMin),
                        (dataMax) =>
                          Math.max(100, dataMax),
                      ]}
                    />

                    <Tooltip
                      formatter={(value) => [
                        formatPercentage(value),
                        'Pencapaian',
                      ]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.tryoutName ??
                        'Tryout'
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="scorePercentage"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-6 flex min-h-48 items-center justify-center rounded-xl bg-slate-50 px-6 text-center text-sm text-slate-500">
                {chartData.length === 1
                  ? 'Selesaikan tryout lainnya untuk melihat tren perkembangan skor.'
                  : 'Belum ada data skor valid untuk ditampilkan pada grafik.'}
              </div>
            )}
          </section>

          {/* Passing grade recap */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Ringkasan Passing Grade
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm text-green-700">
                  Lulus
                </p>
                <p className="mt-2 text-2xl font-bold text-green-800">
                  {summary.passedAttempts ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  Tidak Lulus
                </p>
                <p className="mt-2 text-2xl font-bold text-red-800">
                  {summary.failedAttempts ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-4">
                <p className="text-sm text-slate-600">
                  Belum Dievaluasi
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-800">
                  {summary.notEvaluatedAttempts ?? 0}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default StatisticsPage
