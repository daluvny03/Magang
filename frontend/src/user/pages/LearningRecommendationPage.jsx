import { Link } from 'react-router-dom'
import {
    ArrowUpRight,
    BookOpenCheck,
    Clock3,
    Target,
} from 'lucide-react'

import LearningRecommendationCard from '../components/statistics/LearningRecommendationCard'
import { useLearningRecommendations } from '../hooks/useLearningRecommendations'
import TimeRecommendationSection from '../components/statistics/TimeRecommendationSection'

function LearningRecommendationPage() {
    const {
        data,
        isLoading,
        isError,
    } = useLearningRecommendations()
    const latestAttempt = data?.latestAttempt
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-700">
                    <BookOpenCheck size={20} />
                    <span className="text-sm font-semibold">
                        Pengembangan Kemampuan
                    </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Rekomendasi Belajar
                </h1>

                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    Temukan kategori yang perlu ditingkatkan dan
                    gunakan hasil evaluasi tryout sebagai panduan
                    untuk mempersiapkan ujian berikutnya.
                </p>
            </div>

            {/* Latest Attempt */}
            {latestAttempt && (
                <section className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                                <Target size={22} />
                            </div>

                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Rekomendasi berdasarkan tryout terakhir
                                </p>

                                <h2 className="mt-1 font-bold text-foreground">
                                    {latestAttempt.tryoutName}
                                </h2>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Skor terakhir: {latestAttempt.totalScore ?? '-'}
                                </p>
                            </div>
                        </div>

                        <Link
                            to={`/user/results/${latestAttempt.attemptId}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline"
                        >
                            Lihat hasil tryout
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </section>
            )}

            {/* Category Recommendations */}
            <section className="space-y-3">
                <div>
                    <h2 className="text-lg font-bold text-foreground">
                        Prioritas Belajar
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Fokuskan pembelajaran pada kategori yang
                        masih membutuhkan peningkatan.
                    </p>
                </div>

                <LearningRecommendationCard />
            </section>

            {/* Time Analysis */}
            <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                            <Clock3 size={22} />
                        </div>

                        <div>
                            <h2 className="font-bold text-foreground">
                                Evaluasi Strategi Waktu
                            </h2>

                            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                                Evaluasi kategori yang membutuhkan
                                waktu pengerjaan lebih lama serta
                                soal yang belum sempat dijawab.
                            </p>
                        </div>
                    </div>

                    {latestAttempt && (
                        <Link
                            to={`/user/results/${latestAttempt.attemptId}/analysis`}
                            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-700 px-4 text-sm font-semibold text-white transition hover:bg-primary-700/90"
                        >
                            Lihat Analisis Waktu
                            <ArrowUpRight size={16} />
                        </Link>
                    )}
                </div>

                {!isLoading && !latestAttempt && (
                    <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                        Selesaikan tryout terlebih dahulu untuk
                        mendapatkan evaluasi strategi waktu.
                    </p>
                )}
                {!isLoading && !isError && latestAttempt && (
                    <TimeRecommendationSection
                        time={data?.time}
                    />
                )}
            </section>
        </div>
    )
}

export default LearningRecommendationPage
