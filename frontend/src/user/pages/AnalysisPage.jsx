
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Loader2, RefreshCw } from 'lucide-react'

import { useAttemptAnalysis } from '../hooks/useAttemptAnalysis'
import QuestionAnalysisList from '../components/analysis/QuestionAnalysisList'

const isValidId = (value) =>
  /^[1-9]\d*$/.test(String(value ?? ''))

function AnalysisMessage({ title, description }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 text-center">
      <AlertCircle
        size={32}
        className="mx-auto mb-4 text-slate-400"
        aria-hidden="true"
      />

      <h1 className="text-xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>

      <Link
        to="/user/history"
        className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        Kembali ke Riwayat Tryout
      </Link>
    </div>
  )
}

function AnalysisPageContent({ attemptId }) {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useAttemptAnalysis(attemptId)

  if (isPending && !isError) {
    return (
      <div
        role="status"
        className="flex min-h-[50vh] items-center justify-center gap-3"
      >
        <Loader2
          size={28}
          className="animate-spin text-blue-600"
          aria-hidden="true"
        />

        <span className="text-sm text-slate-500">
          Memuat pembahasan tryout...
        </span>
      </div>
    )
  }

  if (isError) {
    const status = error?.response?.status

    const description =
      status === 404
        ? 'Data analisis tidak ditemukan atau kamu tidak memiliki akses.'
        : status === 409
          ? 'Pembahasan belum tersedia atau data ujian tidak konsisten.'
          : 'Terjadi kesalahan saat memuat analisis.'

    return (
      <div className="space-y-4">
        <AnalysisMessage
          title="Analisis Tidak Tersedia"
          description={description}
        />

        {![401, 403, 404, 409, 422].includes(status) && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!data?.attempt) {
    return (
      <AnalysisMessage
        title="Data Analisis Tidak Tersedia"
        description="Informasi analisis tryout belum dapat ditampilkan."
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <Link
          to={`/user/results/${attemptId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Kembali ke Hasil Tryout
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Analisis Per Soal
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {data.attempt.tryoutName}
          </p>
        </div>
      </header>

      <QuestionAnalysisList
        key={attemptId}
        questions={data.questions ?? []}
      />
    </div>
  )
}

function AnalysisPage() {
  const { attemptId } = useParams()

  if (!isValidId(attemptId)) {
    return (
      <AnalysisMessage
        title="ID Tryout Tidak Valid"
        description="Alamat analisis yang kamu akses tidak valid."
      />
    )
  }

  return <AnalysisPageContent attemptId={attemptId} />
}

export default AnalysisPage
