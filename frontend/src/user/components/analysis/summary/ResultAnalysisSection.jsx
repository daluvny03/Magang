import { AlertCircle, RefreshCw } from 'lucide-react'
import { useAttemptAnalysisSummary } from '@/user/hooks/useAttemptAnalysisSummary'
import AnalysisSummary from './AnalysisSummary'
import CategoryPerformance from './CategoryPerformance'

function AnalysisLoading() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-border bg-card p-6 shadow-soft"
    >
      <div className="space-y-4 motion-safe:animate-pulse">
        <div className="h-6 w-48 rounded bg-muted" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 rounded-xl bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
        </div>
      </div>

      <span className="sr-only">
        Memuat ringkasan analisis tryout
      </span>
    </div>
  )
}

function AnalysisError({ error, onRetry }) {
  const status = error?.response?.status

  const message =
    status === 404
      ? 'Data analisis tidak ditemukan.'
      : status === 409
        ? 'Analisis belum tersedia atau data hasil ujian tidak konsisten.'
        : 'Gagal memuat ringkasan analisis tryout.'
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-5"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          size={22}
          className="mt-0.5 shrink-0 text-destructive"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-red-900">
            Ringkasan Analisis Tidak Tersedia
          </h3>

          <p className="mt-1 text-[14px] text-red-800">
            {message}
          </p>

          {![401, 403, 404, 409, 422].includes(status) && (
            <button
              type="button"
              onClick={onRetry}
              className="focus-ring mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-red-300 bg-white px-4 text-[14px] font-semibold text-red-800 transition hover:bg-red-100"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultAnalysisSection({ attemptId }) {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useAttemptAnalysisSummary(attemptId)

  if (isPending && !isError) {
    return <AnalysisLoading />
  }

  if (isError) {
    return (
      <AnalysisError
        error={error}
        onRetry={() => refetch()}
      />
    )
  }

  if (!data?.summary) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-[14px] text-muted-foreground">
        Ringkasan analisis belum tersedia.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnalysisSummary summary={data.summary} />
      <CategoryPerformance categories={data.categories ?? []} />
    </div>
  )
}

export default ResultAnalysisSection