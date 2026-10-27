
import { Link, useParams } from 'react-router-dom'
import {
    AlertCircle,
    ArrowLeft,
    Loader2,
    RefreshCw,
} from 'lucide-react'

import { useAttemptAnalysis } from '../hooks/useAttemptAnalysis'
import TimeAnalysisSection from '../components/analysis/TimeAnalysisSection'
import { Navigate } from 'react-router-dom'
import {
    isSubscriptionRequiredError,
} from '../utils/subscription-access'

const isValidId = (value) =>
    /^[1-9]\d*$/.test(String(value ?? ''))

function TimeAnalysisMessage({ title, description }) {
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

function TimeAnalysisContent({ attemptId }) {
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
                    Memuat analisis waktu...
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

        return (
            <div className="space-y-4">
                <TimeAnalysisMessage
                    title="Analisis Waktu Tidak Tersedia"
                    description={
                        status === 404
                            ? 'Data ujian tidak ditemukan atau kamu tidak memiliki akses.'
                            : status === 409
                                ? 'Analisis waktu belum tersedia atau data ujian tidak konsisten.'
                                : 'Terjadi kesalahan saat memuat analisis waktu.'
                    }
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
            <TimeAnalysisMessage
                title="Data Analisis Tidak Tersedia"
                description="Informasi analisis waktu belum dapat ditampilkan."
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
                    <ArrowLeft size={16} />
                    Kembali ke Hasil Tryout
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        Analisis Manajemen Waktu
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        {data.attempt.tryoutName}
                    </p>
                </div>
            </header>

            <TimeAnalysisSection
                questions={data.questions ?? []}
                timeAnalysis={data.timeAnalysis}
                summary={data.summary}
            />
        </div>
    )
}

function TimeAnalysisPage() {
    const { attemptId } = useParams()

    if (!isValidId(attemptId)) {
        return (
            <TimeAnalysisMessage
                title="ID Tryout Tidak Valid"
                description="Alamat analisis waktu tidak valid."
            />
        )
    }

    return <TimeAnalysisContent attemptId={attemptId} />
}

export default TimeAnalysisPage
