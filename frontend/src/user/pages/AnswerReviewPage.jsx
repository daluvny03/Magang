
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Loader2, RefreshCw } from 'lucide-react'

import { useAttemptAnalysis } from '../hooks/useAttemptAnalysis'
import QuestionAnalysisList from '../components/analysis/QuestionAnalysisList'
import { Navigate } from 'react-router-dom'
import {
    isSubscriptionRequiredError,
} from '../utils/subscription-access'

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

function AnswerReviewPageContent({ attemptId }) {
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
                    Memuat analisis jawaban dan pembahasan soal...
                </span>
            </div>
        )
    }

    if (isError && isSubscriptionRequiredError(error)) {
        return (
            <Navigate
                to="/user/forbidden"
                replace
            />
        )
    }

    if (isError) {
        const status = error?.response?.status

        const description =
            status === 404
                ? 'Analisis jawaban tidak ditemukan atau kamu tidak memiliki akses ke pembahasan tryout ini.'
                : status === 409
                    ? 'Analisis jawaban dan pembahasan soal belum dapat ditampilkan untuk tryout ini.'
                    : 'Terjadi kesalahan saat memuat analisis jawaban dan pembahasan soal.'

        return (
            <div className="space-y-4">
                <AnalysisMessage
                    title="Analisis Jawaban Tidak Tersedia"
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
                title="Analisis Jawaban Tidak Tersedia"
                description="Jawaban dan pembahasan soal untuk tryout ini belum dapat ditampilkan."
            />
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
                <div className="mx-auto flex min-h-20 max-w-[1600px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Pembahasan CAT CPNS</p>
                        <h1 className="mt-1 text-base font-bold text-gray-900 lg:text-lg">{data.attempt.tryoutName}</h1>
                    </div>
                    <Link to={`/user/results/${attemptId}`} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700">
                        <ArrowLeft size={16} aria-hidden="true" /> Hasil Tryout
                    </Link>
                </div>
            </header>
            <QuestionAnalysisList key={attemptId} questions={data.questions ?? []} resultUrl={`/user/results/${attemptId}`} />
        </div>
    )
}

function AnswerReviewPage() {
    const { attemptId } = useParams()

    if (!isValidId(attemptId)) {
        return (
            <AnalysisMessage
                title="ID Tryout Tidak Valid"
                description="Alamat halaman analisis jawaban dan pembahasan yang kamu akses tidak valid."
            />
        )
    }

    return <AnswerReviewPageContent attemptId={attemptId} />
}

export default AnswerReviewPage
