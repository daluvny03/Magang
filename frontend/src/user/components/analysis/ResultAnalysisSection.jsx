
import { AlertCircle, RefreshCw } from 'lucide-react'

import { useAttemptAnalysis } from '../../hooks/useAttemptAnalysis'

import AnalysisSummary from './AnalysisSummary'
import CategoryPerformance from './CategoryPerformance'

function AnalysisLoading() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 rounded bg-slate-200" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 rounded-xl bg-slate-100" />
          <div className="h-28 rounded-xl bg-slate-100" />
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
          size={20}
          className="mt-0.5 shrink-0 text-red-600"
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-red-900">
            Ringkasan Analisis Tidak Tersedia
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {message}
          </p>

          {![401, 403, 404, 409, 422].includes(status) && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
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
  } = useAttemptAnalysis(attemptId)

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
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Ringkasan analisis belum tersedia.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnalysisSummary
        summary={data.summary}
      />

      <CategoryPerformance
        categories={data.categories ?? []}
      />
    </div>
  )
}

export default ResultAnalysisSection
