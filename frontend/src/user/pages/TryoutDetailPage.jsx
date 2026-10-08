import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Clock3,
    Lock,
    Play,
    ShieldCheck,
} from 'lucide-react'
import {
    useNavigate,
    useParams,
} from 'react-router-dom'

import { useTryoutDetail } from '../hooks/useTryoutDetail'
import { useStartTryout } from '../hooks/useStartTryout'

function TryoutDetailPage() {
    const navigate = useNavigate()
    const startTryoutMutation =
        useStartTryout()
    const { tryoutId } = useParams()

    const {
        data: tryoutResponse,
        isLoading,
        isError,
        error,
    } = useTryoutDetail(tryoutId)

    const tryout = tryoutResponse?.data

    const handleStartTryout = async () => {
        try {
            const response =
                await startTryoutMutation.mutateAsync(
                    tryoutId
                )

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
            console.error(
                'Failed to start tryout:',
                error
            )
        }
    }

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl space-y-5">
                <div className="h-6 w-32 animate-pulse rounded bg-gray-100" />

                <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />

                <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="mx-auto max-w-5xl">
                <button
                    type="button"
                    onClick={() => navigate('/user/tryouts')}
                    className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-700"
                >
                    <ArrowLeft size={17} />
                    Kembali ke Tryout
                </button>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                    <p className="text-sm font-medium text-red-700">
                        {error?.response?.data?.message ||
                            'Gagal memuat detail tryout.'}
                    </p>
                </div>
            </div>
        )
    }

    if (!tryout) return null

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Back */}
            <button
                type="button"
                onClick={() => navigate('/user/tryouts')}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-primary-700"
            >
                <ArrowLeft size={17} />
                Kembali ke Tryout
            </button>

            {/* Tryout Information */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                            <BookOpen size={22} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                {tryout.name}
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                                {tryout.description ||
                                    'Simulasi tryout untuk membantu persiapan seleksi CPNS.'}
                            </p>
                        </div>
                    </div>

                    <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${tryout.isFree
                            ? 'bg-green-50 text-green-700'
                            : 'bg-primary-50 text-primary-700'
                            }`}
                    >
                        {tryout.isFree ? 'Gratis' : 'Premium'}
                    </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-gray-50 p-4">
                        <Clock3
                            size={18}
                            className="text-gray-500"
                        />

                        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                            Durasi
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                            {tryout.durationMinutes} menit
                        </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        <BookOpen
                            size={18}
                            className="text-gray-500"
                        />

                        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                            Jumlah Soal
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                            {tryout.questionCount} soal
                        </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                        <CheckCircle2
                            size={18}
                            className="text-gray-500"
                        />

                        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                            Passing Score
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                            {tryout.passingScore ?? '-'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Preparation */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                        <ShieldCheck size={19} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Sebelum Memulai
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Pastikan kamu sudah siap sebelum memulai
                            pengerjaan tryout.
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-3 text-sm leading-6 text-gray-600">
                    <p>
                        1. Pastikan koneksi internet dalam kondisi
                        stabil selama pengerjaan.
                    </p>

                    <p>
                        2. Siapkan waktu sekitar{' '}
                        <span className="font-semibold text-gray-900">
                            {tryout.durationMinutes} menit
                        </span>{' '}
                        untuk menyelesaikan tryout.
                    </p>

                    <p>
                        3. Tryout terdiri dari{' '}
                        <span className="font-semibold text-gray-900">
                            {tryout.questionCount} soal
                        </span>
                        .
                    </p>

                    <p>
                        4. Waktu pengerjaan akan berjalan setelah
                        tryout dimulai.
                    </p>

                    <p>
                        5. Pastikan semua jawaban sudah diperiksa
                        sebelum menyelesaikan tryout.
                    </p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                    {tryout.isAccessible ? (
                        <button
                            type="button"
                            onClick={handleStartTryout}
                            disabled={startTryoutMutation.isPending}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <Play size={17} />

                            {startTryoutMutation.isPending
                                ? 'Memulai...'
                                : 'Mulai Tryout'}
                        </button>
                    ) : (
                        <div className="rounded-xl bg-gray-50 p-4 text-center">
                            <Lock
                                size={20}
                                className="mx-auto text-gray-400"
                            />

                            <p className="mt-2 text-sm font-semibold text-gray-700">
                                Tryout Terkunci
                            </p>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                Paket langgananmu belum memiliki akses
                                ke tryout ini.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default TryoutDetailPage