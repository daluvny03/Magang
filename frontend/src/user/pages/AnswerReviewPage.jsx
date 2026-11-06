import { Navigate, useParams } from 'react-router-dom'
import { AlertCircle, RefreshCw, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

import EmptyState from '@/user/components/common/EmptyState'
import { Skeleton } from '@/user/components/common/Skeletons'
import { buttonClass } from '@/user/components/common/buttonStyles'

import { useAttemptAnalysis } from '../hooks/useAttemptAnalysis'
import QuestionAnalysisList from '../components/analysis/review/QuestionAnalysisList'
import ReviewHeader from '../components/analysis/review/ReviewHeader'
import { isSubscriptionRequiredError } from '../utils/subscription-access'

const isValidId = (value) => /^[1-9]\d*$/.test(String(value ?? ''))

const ERROR_DESCRIPTIONS = {
    404: 'Analisis jawaban tidak ditemukan atau kamu tidak memiliki akses ke pembahasan tryout ini.',
    409: 'Analisis jawaban dan pembahasan soal belum dapat ditampilkan untuk tryout ini.',
}

const DEFAULT_ERROR_DESCRIPTION =
    'Terjadi kesalahan saat memuat analisis jawaban dan pembahasan soal.'

const NON_RETRYABLE_STATUSES = [401, 403, 404, 409, 422]

function Screen({ children }) {
    return (
        <div className="mx-auto w-full max-w-xl px-4 py-16 font-user">
            {children}
        </div>
    )
}

function BackToHistory() {
    return (
        <Link to="/user/history" className={buttonClass.outline}>
            Kembali ke Riwayat Tryout
        </Link>
    )
}

function ReviewSkeleton() {
    return (
        <div
            role="status"
            className="mx-auto w-full max-w-[1600px] space-y-5 px-3 py-6 font-user sm:px-6 lg:px-8"
        >
            <Skeleton className="h-14 w-full" />

            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                <Skeleton className="h-72 rounded-2xl lg:order-last lg:h-[34rem]" />
                <Skeleton className="h-[34rem] rounded-2xl" />
            </div>

            <span className="sr-only">
                Memuat analisis jawaban dan pembahasan soal...
            </span>
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
        return <ReviewSkeleton />
    }

    if (isError && isSubscriptionRequiredError(error)) {
        return <Navigate to="/user/forbidden" replace />
    }

    if (isError) {
        const status = error?.response?.status
        const canRetry = !NON_RETRYABLE_STATUSES.includes(status)

        return (
            <Screen>
                <EmptyState
                    icon={AlertCircle}
                    title="Analisis Jawaban Tidak Tersedia"
                    description={
                        ERROR_DESCRIPTIONS[status] ?? DEFAULT_ERROR_DESCRIPTION
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
            </Screen>
        )
    }

    if (!data?.attempt) {
        return (
            <Screen>
                <EmptyState
                    icon={SearchX}
                    title="Analisis Jawaban Tidak Tersedia"
                    description="Jawaban dan pembahasan soal untuk tryout ini belum dapat ditampilkan."
                    action={<BackToHistory />}
                />
            </Screen>
        )
    }

    const resultUrl = `/user/results/${attemptId}`

    return (
        <div className="flex min-h-screen flex-col bg-background font-user text-foreground">
            <ReviewHeader title={data.attempt.tryoutName} resultUrl={resultUrl} />

            <QuestionAnalysisList
                key={attemptId}
                questions={data.questions ?? []}
                resultUrl={resultUrl}
            />
        </div>
    )
}

function AnswerReviewPage() {
    const { attemptId } = useParams()

    if (!isValidId(attemptId)) {
        return (
            <Screen>
                <EmptyState
                    icon={SearchX}
                    title="ID Tryout Tidak Valid"
                    description="Alamat halaman analisis jawaban dan pembahasan yang kamu akses tidak valid."
                    action={<BackToHistory />}
                />
            </Screen>
        )
    }

    return <AnswerReviewPageContent attemptId={attemptId} />
}

export default AnswerReviewPage