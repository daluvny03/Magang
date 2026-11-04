
import { Link } from 'react-router-dom'
import {
    AlertCircle,
    ArrowRight,
    RefreshCw,
    Target,
} from 'lucide-react'

import Surface from '@/user/components/common/Surface'
import { buttonClass } from '@/user/components/common/buttonStyles'

import { useLearningRecommendations } from '@/user/hooks/useLearningRecommendations'

const formatDate = (value) => {
    if (!value) return null

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return null

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(date)
}

const getWeaknessPercentage = (priority) => {
    const percentage = Number(
        priority.weaknessPercentage ??
        Number(priority.weaknessRate ?? 0) * 100
    )

    if (!Number.isFinite(percentage)) return 0

    return Math.min(100, Math.max(0, percentage))
}

function RecommendationSkeleton() {
    return (
        <Surface className="space-y-5 p-5">
            <div className="h-6 w-56 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />

            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-56 animate-pulse rounded-xl bg-gray-100"
                    />
                ))}
            </div>

            <span className="sr-only">
                Memuat rekomendasi belajar...
            </span>
        </Surface>
    )
}

function PriorityItem({ priority, index }) {
    const percentage = getWeaknessPercentage(priority)
    const answeredCount = Number(priority.answeredCount ?? 0)
    const affectedCount = Number(priority.affectedCount ?? 0)
    const isWrongAnswer =
        priority.measurement === 'wrong_answers'

    const categoryName =
        priority.categoryPath || priority.categoryName || 'Kategori'

    return (
        <div className="rounded-xl border border-gray-200 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-500">
                    PRIORITAS {priority.rank ?? index + 1}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                    {index === 0 && (
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                            Prioritas utama
                        </span>
                    )}
                </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
                {categoryName}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
                {priority.rootCategorySlug?.toUpperCase() ?? ''}
            </p>

            <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">
                    Tingkat kelemahan
                </span>

                <span className="text-sm font-semibold text-gray-900">
                    {percentage.toFixed(0)}%
                </span>
            </div>

            <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"
                role="progressbar"
                aria-label={`Tingkat kelemahan ${categoryName}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
            >
                <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-500">
                {priority.reason}
            </p>

            <div className="mt-4 text-sm text-gray-500">
                {isWrongAnswer
                    ? `${affectedCount} soal salah dari ${answeredCount} soal dijawab`
                    : `${affectedCount} soal mengalami kehilangan skor dari ${answeredCount} soal dijawab`}
            </div>
        </div>
    )
}

function LearningRecommendationCard() {
    const {
        data,
        isPending,
        isError,
        error,
        refetch,
    } = useLearningRecommendations()

    if (isPending) {
        return <RecommendationSkeleton />
    }

    if (isError) {
        const devNote = import.meta.env.DEV && error?.message
            ? ` (${error.message})`
            : ''

        return (
            <Surface className="p-5" role="alert">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900">
                            Rekomendasi Belajar Tidak Tersedia
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Gagal memuat rekomendasi belajar.
                            Silakan coba kembali.{devNote}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        className={buttonClass.outline}
                    >
                        <RefreshCw size={16} aria-hidden="true" />
                        Coba Lagi
                    </button>
                </div>
            </Surface>
        )
    }

    const latestAttempt = data?.latestAttempt
    const learning = data?.learning
    const priorities = learning?.priorities ?? []

    if (!latestAttempt) {
        return (
            <Surface className="p-5">
                <div className="flex items-start gap-3">
                    <Target className="mt-1 text-gray-400" size={22} />

                    <div>
                        <h2 className="font-semibold text-gray-900">
                            Rekomendasi Belajar
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Selesaikan tryout terlebih dahulu untuk mendapatkan
                            rekomendasi berdasarkan hasil pengerjaanmu.
                        </p>

                        <Link
                            to="/user/tryouts"
                            className={`${buttonClass.outline} mt-4`}
                        >
                            Jelajahi Tryout
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </Surface>
        )
    }

    return (
        <Surface className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Target size={20} className="text-primary-600" />

                        <h2 className="text-xl font-semibold text-gray-900">
                            Rekomendasi Belajar
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        Prioritas disusun berdasarkan hasil tryout terakhir.
                    </p>
                </div>

                <div className="text-sm text-gray-500">
                    {latestAttempt.tryoutName}
                    {formatDate(latestAttempt.completedAt) && (
                        <span className="block mt-1">
                            {formatDate(latestAttempt.completedAt)}
                        </span>
                    )}
                </div>
            </div>

            {!learning?.hasRecommendation || priorities.length === 0 ? (
                <div className="rounded-xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-900">
                        Belum Ada Prioritas Belajar
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Hasil tryout terakhir belum menghasilkan kategori
                        yang perlu diprioritaskan berdasarkan aturan rekomendasi.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {priorities.map((priority, index) => (
                        <PriorityItem
                            key={priority.categoryId}
                            priority={priority}
                            index={index}
                        />
                    ))}
                </div>
            )}

            <div className="flex justify-end">
                <Link
                    to={`/user/results/${latestAttempt.attemptId}`}
                    className={buttonClass.outline}
                >
                    Lihat Hasil Tryout
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </div>
        </Surface>
    )
}

export default LearningRecommendationCard
