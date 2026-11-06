import { Link, Navigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BookOpen, RefreshCw, SearchX } from 'lucide-react'

import EmptyState from '@/user/components/common/EmptyState'
import PageHeader from '@/user/components/common/PageHeader'
import { buttonClass } from '@/user/components/common/buttonStyles'
import { ChartSkeleton, StatSkeleton } from '@/user/components/common/Skeletons'

import { useAttemptAnalysis } from '../hooks/useAttemptAnalysis'
import TimeAnalysisSection from '../components/analysis/time/TimeAnalysisSection'
import { isSubscriptionRequiredError } from '../utils/subscription-access'

const isValidId = (value) => /^[1-9]\d*$/.test(String(value ?? ''))

function BackToHistory() {
    return (
        <Link to="/user/history" className={buttonClass.outline}>
            Kembali ke Riwayat Tryout
        </Link>
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
            <div role="status" className="mx-auto w-full max-w-7xl space-y-6">
                <StatSkeleton count={4} />
                <ChartSkeleton className="h-80" />
                <ChartSkeleton className="h-72" />

                <span className="sr-only">Memuat analisis waktu...</span>
            </div>
        )
    }

    if (isError && isSubscriptionRequiredError(error)) {
        return <Navigate to="/user/forbidden" replace />
    }

    if (isError) {
        const status = error?.response?.status
        const canRetry = ![401, 403, 404, 409, 422].includes(status)

        return (
            <EmptyState
                icon={AlertCircle}
                title="Analisis Waktu Tidak Tersedia"
                description={
                    status === 404
                        ? 'Data ujian tidak ditemukan atau kamu tidak memiliki akses.'
                        : status === 409
                            ? 'Analisis waktu belum tersedia atau data ujian tidak konsisten.'
                            : 'Terjadi kesalahan saat memuat analisis waktu.'
                }
                action={
                    <>
                        {canRetry && (
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className={buttonClass.solid}
                            >
                                <RefreshCw size={16} aria-hidden="true" />
                                Coba Lagi
                            </button>
                        )}

                        <BackToHistory />
                    </>
                }
            />
        )
    }

    if (!data?.attempt) {
        return (
            <EmptyState
                icon={SearchX}
                title="Data Analisis Tidak Tersedia"
                description="Informasi analisis waktu belum dapat ditampilkan."
                action={<BackToHistory />}
            />
        )
    }

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6">
            <PageHeader
                eyebrow={data.attempt.tryoutName}
                title="Analisis Waktu per Soal"
                subtitle="Ketahui berapa lama kamu mengerjakan tiap soal dan di mana waktumu habis terpakai."
                actions={
                    <>
                        <Link
                            to={`/user/results/${attemptId}`}
                            className={buttonClass.outline}
                        >
                            <ArrowLeft size={18} aria-hidden="true" />
                            Kembali ke Hasil
                        </Link>

                        <Link
                            to={`/user/results/${attemptId}/answers`}
                            className={buttonClass.solid}
                        >
                            <BookOpen size={18} aria-hidden="true" />
                            Pembahasan Soal
                        </Link>
                    </>
                }
            />

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
            <EmptyState
                icon={SearchX}
                title="ID Tryout Tidak Valid"
                description="Alamat analisis waktu tidak valid."
                action={<BackToHistory />}
            />
        )
    }

    return <TimeAnalysisContent attemptId={attemptId} />
}

export default TimeAnalysisPage