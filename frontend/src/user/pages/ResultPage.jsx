import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import AdvancedAnalysisCard from '../components/result/AdvancedAnalysisCard'
import CategoryBreakdown from '../components/result/CategoryBreakdown'
import { useAttemptAnalysisSummary } from '../hooks/useAttemptAnalysisSummary'
import ResultInformationCard from '../components/result/ResultInformationCard'
import ResultAnalysisSection from '../components/analysis/ResultAnalysisSection'
import { useAttemptResult } from '../hooks/useAttemptResult'

function ResultSkeleton() {
    return (
        <div role="status" className="mx-auto w-full max-w-7xl space-y-6">
            <div className="h-9 w-56 rounded-lg bg-muted motion-safe:animate-pulse" />
            <div className="h-[28rem] rounded-2xl bg-muted motion-safe:animate-pulse" />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-72 rounded-2xl bg-muted motion-safe:animate-pulse"
                    />
                ))}
            </div>

            <span className="sr-only">Memuat hasil tryout...</span>
        </div>
    )
}

function ResultMessage({ title, description }) {
    return (
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 rounded-full bg-destructive/10 p-4">
                <AlertCircle
                    size={32}
                    aria-hidden="true"
                    className="text-destructive"
                />
            </div>

            <h1 className="text-[20px] font-bold text-foreground">
                {title}
            </h1>

            <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                {description}
            </p>

            <Link
                to="/user/history"
                className="focus-ring mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-primary-700 px-5 text-[14px] font-semibold text-white transition hover:bg-primary-700/90"
            >
                <ArrowLeft size={18} aria-hidden="true" />
                Kembali ke Riwayat Tryout
            </Link>
        </div>
    )
}

function ResultPage() {
    const { attemptId } = useParams()

    const isValidAttemptId =
        /^[1-9]\d*$/.test(String(attemptId ?? ''))

    const {
        data,
        isLoading,
        isError,
        error,
    } = useAttemptResult(attemptId)
    const { data: analysis } = useAttemptAnalysisSummary(attemptId)
    const result = data?.data

    if (!isValidAttemptId) {
        return (
            <ResultMessage
                title="ID Tryout Tidak Valid"
                description="Alamat hasil tryout yang kamu akses tidak valid."
            />
        )
    }

    if (isLoading) {
        return <ResultSkeleton />
    }

    if (isError) {
        const isNotFound = error?.response?.status === 404

        return (
            <ResultMessage
                title={
                    isNotFound
                        ? 'Hasil Tryout Tidak Ditemukan'
                        : 'Gagal Memuat Hasil Tryout'
                }
                description={
                    isNotFound
                        ? 'Hasil tryout tidak tersedia atau kamu tidak memiliki akses.'
                        : 'Terjadi kesalahan saat mengambil hasil tryout. Silakan coba kembali.'
                }
            />
        )
    }

    if (!result?.attempt || !result?.summary) {
        return (
            <ResultMessage
                title="Data Hasil Tidak Tersedia"
                description="Data hasil tryout belum dapat ditampilkan."
            />
        )
    }

    const { attempt, summary, categories = [] } = result

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <div className="space-y-3">
                <Link
                    to="/user/history"
                    className="focus-ring inline-flex items-center gap-2 rounded-lg text-[14px] font-medium text-muted-foreground transition hover:text-primary-700"
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                    Kembali ke Riwayat Tryout
                </Link>

                <h1 className="text-[26px] font-bold text-foreground sm:text-[30px]">
                    Hasil Tryout
                </h1>
            </div>

            <ResultInformationCard
                attempt={attempt}
                summary={summary}
            />

            <CategoryBreakdown
                categories={categories}
                analysisCategories={analysis?.categories ?? []}
            />

            <section
                aria-labelledby="result-analysis-heading"
                className="space-y-4"
            >
                <div>
                    <h2
                        id="result-analysis-heading"
                        className="text-[19px] font-bold text-foreground"
                    >
                        Analisis Hasil Tryout
                    </h2>

                    <p className="mt-1 text-[14px] text-muted-foreground">
                        Ringkasan pencapaian skor, akurasi, penyelesaian soal,
                        dan waktu pengerjaan ujian.
                    </p>
                </div>

                <ResultAnalysisSection attemptId={attemptId} />
            </section>

            <AdvancedAnalysisCard attemptId={attemptId} />
        </div>
    )
}

export default ResultPage