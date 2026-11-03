import { Link } from 'react-router-dom'
import { AlertCircle, ClipboardCheck, RefreshCw } from 'lucide-react'
import LearningRecommendationCard from '@/user/components/statistics/LearningRecommendationCard'
import EmptyState from '@/user/components/common/EmptyState'
import PageHeader from '@/user/components/common/PageHeader'
import Surface from '@/user/components/common/Surface'
import {
    ChartSkeleton,
    Skeleton,
    StatSkeleton,
} from '@/user/components/common/Skeletons'
import { buttonClass } from '@/user/components/common/buttonStyles'
import PassingDistributionCard from '@/user/components/statistics/PassingDistributionCard'
import ScoreTrendCard from '@/user/components/statistics/ScoreTrendCard'
import SummaryCards from '@/user/components/statistics/SummaryCards'
import { buildTrendPoints } from '@/user/utils/statistics'

import { useAttemptStatistics } from '../hooks/useAttemptStatistics'

function StatisticsSkeleton() {
    return (
        <div role="status" className="mx-auto w-full max-w-7xl space-y-6">
            <Skeleton className="h-16 w-72" />
            <StatSkeleton />

            <div className="grid gap-5 lg:grid-cols-3">
                <ChartSkeleton className="h-96 lg:col-span-2" />

                <Surface className="p-5">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mx-auto mt-6 h-44 w-44 rounded-full" />
                </Surface>
            </div>

            <span className="sr-only">Memuat statistik performa...</span>
        </div>
    )
}

function StatisticsPage() {
    const {
        data,
        isPending,
        isError,
        error,
        refetch,
    } = useAttemptStatistics()

    if (isPending) {
        return <StatisticsSkeleton />
    }

    if (isError) {
        const devNote = import.meta.env.DEV && error?.message
            ? ` (${error.message})`
            : ''

        return (
            <div role="alert" className="mx-auto w-full max-w-5xl">
                <EmptyState
                    icon={AlertCircle}
                    title="Gagal Memuat Statistik"
                    description={`Statistik belum berhasil diambil. Silakan coba kembali.${devNote}`}
                    action={
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className={buttonClass.solid}
                        >
                            <RefreshCw size={16} aria-hidden="true" />
                            Coba Lagi
                        </button>
                    }
                />
            </div>
        )
    }

    const summary = data?.summary ?? {}
    const hasAttempts = Number(summary.totalAttempts ?? 0) > 0
    const points = buildTrendPoints(data?.trend)

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6">
            <PageHeader
                eyebrow="Analisis Performa"
                title="Statistik Performa"
                subtitle="Pantau perkembangan skor dan hasil simulasi CAT CPNS."
            />

            {!hasAttempts ? (
                <EmptyState
                    icon={ClipboardCheck}
                    title="Belum ada statistik"
                    description="Selesaikan tryout pertamamu untuk mulai melihat perkembangan performa."
                    action={
                        <Link to="/user/tryouts" className={buttonClass.solid}>
                            Jelajahi Tryout
                        </Link>
                    }
                />
            ) : (
                <>
                    <SummaryCards summary={summary} />

                    <div className="grid gap-5 lg:grid-cols-3">
                        <ScoreTrendCard
                            points={points}
                            title="Tren Pencapaian Skor"
                            subtitle="Maksimal 20 tryout terbaru, dari pengerjaan paling lama ke terbaru."
                            height={320}
                            showLink={false}
                        />

                        <PassingDistributionCard summary={summary} />
                    </div>
                    <LearningRecommendationCard />
                </>
            )}
        </div>
    )
}

export default StatisticsPage
