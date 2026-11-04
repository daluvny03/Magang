import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, RefreshCw, SearchX } from 'lucide-react'

import { logRequestError } from '../../utils/log-request-error'
import EmptyState from '@/user/components/common/EmptyState'
import Surface from '@/user/components/common/Surface'
import { Skeleton } from '@/user/components/common/Skeletons'
import { buttonClass } from '@/user/components/common/buttonStyles'
import { getTryoutState } from '@/user/utils/tryoutDisplay'

import { useTryoutDetail } from '../hooks/useTryoutDetail'
import { useStartTryout } from '../hooks/useStartTryout'
import {
    getTryoutScheduleStatus,
    hasActiveTryoutAttempt,
} from '../utils/tryout-availability'
import { useAuthStore } from '../../stores/authStore'
import TryoutInfoCard from '../components/tryout/TryoutInfoCard'
import TryoutScheduleCard from '../components/tryout/TryoutScheduleCard'
import TryoutStartPanel from '../components/tryout/TryoutStartPanel'

const SCHEDULE_LABELS = {
    upcoming: 'Belum dimulai',
    active: 'Periode aktif',
    ended: 'Periode mulai berakhir',
}

function BackLink() {
    return (
        <Link
            to="/user/tryouts"
            className="focus-ring inline-flex items-center gap-2 rounded-lg text-[14px] font-medium text-muted-foreground transition hover:text-primary-700"
        >
            <ArrowLeft size={18} aria-hidden="true" />
            Kembali ke Tryout
        </Link>
    )
}

function DetailSkeleton() {
    return (
        <div role="status" className="mx-auto w-full max-w-5xl space-y-5">
            <Skeleton className="h-6 w-40" />

            <Surface className="overflow-hidden">
                <Skeleton className="h-28 w-full rounded-none" />

                <div className="space-y-4 p-6">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-5 w-full" />

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                        <Skeleton className="h-24" />
                    </div>
                </div>
            </Surface>

            <Skeleton className="h-48 w-full rounded-2xl" />

            <span className="sr-only">Memuat detail tryout...</span>
        </div>
    )
}

function TryoutDetailPage() {
    const navigate = useNavigate()
    const startTryoutMutation = useStartTryout()
    const { tryoutId } = useParams()

    const {
        data: tryoutResponse,
        isLoading,
        isError,
        error,
        isFetching,
        refetch,
    } = useTryoutDetail(tryoutId)

    const tryout = tryoutResponse?.data

    const handleStartTryout = async () => {
        if (tryout?.activeAttempt?.id) {
            if (hasActiveTryoutAttempt(tryout)) {
                navigate(`/user/cat/${tryout.activeAttempt.id}`)
            } else {
                await refetch()
            }
            return
        }
        const requestingUserId = useAuthStore.getState().user?.id
        try {
            const response =
                await startTryoutMutation.mutateAsync(
                    tryoutId
                )
            if (useAuthStore.getState().user?.id !== requestingUserId) return

            const attempt =
                response?.data?.attempt

            if (!attempt?.id) {
                throw new Error(
                    'Attempt ID not found'
                )
            }

            navigate(
                `/user/cat/${attempt.id}`
            )
        } catch (error) {
            if (useAuthStore.getState().user?.id !== requestingUserId) return
            logRequestError(
                'Failed to start tryout:',
                error
            )
            // Muat ulang hak akses, jadwal, dan attempt setelah penolakan server.
            await refetch()
        }
    }

    if (isLoading) {
        return <DetailSkeleton />
    }

    if (isError) {
        const status = error?.response?.status
        const canRetry = ![401, 403, 404].includes(status)

        return (
            <div className="mx-auto w-full max-w-5xl space-y-5">
                <BackLink />

                <EmptyState
                    icon={AlertCircle}
                    title="Detail Tryout Tidak Tersedia"
                    description={
                        error?.response?.data?.message ||
                        'Gagal memuat detail tryout.'
                    }
                    action={
                        canRetry && (
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className={buttonClass.solid}
                            >
                                <RefreshCw size={16} aria-hidden="true" />
                                Coba Lagi
                            </button>
                        )
                    }
                />
            </div>
        )
    }

    if (!tryout) {
        return (
            <div className="mx-auto w-full max-w-5xl space-y-5">
                <BackLink />

                <EmptyState
                    icon={SearchX}
                    title="Detail Tryout Tidak Tersedia"
                    description="Informasi tryout ini belum dapat ditampilkan."
                />
            </div>
        )
    }

    const hasActiveAttempt = hasActiveTryoutAttempt(tryout)
    const scheduleStatus = getTryoutScheduleStatus(tryout)

    const canResume = hasActiveAttempt

    const canStart =
        !hasActiveAttempt &&
        tryout.isAccessible &&
        scheduleStatus === 'active'

    const canStartOrResume = canResume || canStart

    const scheduleLabel =
        SCHEDULE_LABELS[scheduleStatus] || 'Jadwal belum tersedia'

    const startErrorMessage = startTryoutMutation.isError
        ? startTryoutMutation.error?.response?.data?.message ||
          'Gagal memulai atau melanjutkan tryout. Silakan coba kembali.'
        : null

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            <BackLink />

            <TryoutInfoCard
                tryout={tryout}
                stateKey={getTryoutState(tryout)}
            />

            <TryoutScheduleCard
                tryout={tryout}
                scheduleStatus={scheduleStatus}
                hasActiveAttempt={hasActiveAttempt}
            />

            <TryoutStartPanel
                tryout={tryout}
                hasActiveAttempt={hasActiveAttempt}
                canStartOrResume={canStartOrResume}
                scheduleLabel={scheduleLabel}
                isPending={startTryoutMutation.isPending}
                isFetching={isFetching}
                errorMessage={startErrorMessage}
                onStart={handleStartTryout}
                onViewSubscription={() => navigate('/user/subscription')}
            />
        </div>
    )
}

export default TryoutDetailPage