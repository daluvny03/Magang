
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { useAttemptResult } from '../hooks/useAttemptResult'

import ResultInformationCard from '../components/result/ResultInformationCard'
import CategoryResultCard from '../components/result/CategoryResultCard'

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
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2
                        className="h-8 w-8 animate-spin text-blue-600"
                    />
                    <p className="text-sm text-gray-500">
                        Memuat hasil tryout...
                    </p>
                </div>
            </div>
        )
    }

    if (isError) {
        const isNotFound =
            error?.response?.status === 404

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
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="space-y-4">
                <Link
                    to="/user/tryouts"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Daftar Tryout
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Hasil Tryout
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        {attempt.tryoutName}
                    </p>
                </div>
            </div>

            <ResultInformationCard
                attempt={attempt}
                summary={summary}
            />

            {/* Section 6C.4 */}
            <section
                aria-labelledby="category-result-heading"
                className="space-y-4"
            >
                <div>
                    <h2
                        id="category-result-heading"
                        className="text-xl font-bold text-gray-900"
                    >
                        Hasil Per Kategori
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Ringkasan nilai dan pengerjaan setiap kategori ujian.
                    </p>
                </div>

                {categories.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {categories.map((category) => (
                            <CategoryResultCard
                                key={category.slug}
                                category={category}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
                        Data hasil per kategori tidak tersedia.
                    </div>
                )}
            </section>

            {/* Section 6H */}
            <section
                aria-label="Detail pembahasan"
                className="rounded-xl border border-gray-200 bg-white p-6"
            >
                <h2 className="text-lg font-semibold text-gray-900">
                    Detail Pembahasan & Analisis
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Pembahasan, jawaban, dan waktu pengerjaan
                    setiap soal akan ditampilkan di sini.
                </p>
            </section>
        </div>
    )
}

function ResultMessage({ title, description }) {
    return (
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 rounded-full bg-red-50 p-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
            </div>

            <h1 className="text-xl font-semibold text-gray-900">
                {title}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
                {description}
            </p>

            <Link
                to="/user/tryouts"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Tryout
            </Link>
        </div>
    )
}

export default ResultPage
