import {
    ArrowRight,
    BookOpenCheck,
    Clock3,
    Crown,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const FEATURES = [
    {
        title: 'Kunci Jawaban & Pembahasan',
        description:
            'Tinjau jawaban yang telah kamu pilih, lihat kunci jawaban, dan pelajari pembahasan setiap soal.',
        icon: BookOpenCheck,
        path: 'answers',
    },
    {
        title: 'Analisis Waktu Per Soal',
        description:
            'Evaluasi durasi pengerjaan setiap soal untuk mengetahui soal yang paling banyak menghabiskan waktu.',
        icon: Clock3,
        path: 'analysis',
    },
]

function AdvancedAnalysisCard({ attemptId }) {
    return (
        <section
            aria-labelledby="advanced-analysis-title"
            className="space-y-4"
        >
            <div>
                <div className="flex flex-wrap items-center gap-3">
                    <h2
                        id="advanced-analysis-title"
                        className="text-[19px] font-bold text-foreground"
                    >
                        Analisis Lanjutan
                    </h2>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[13px] font-semibold text-amber-800">
                        <Crown size={15} aria-hidden="true" />
                        Fitur Subscription
                    </span>
                </div>

                <p className="mt-1 text-[14px] text-muted-foreground">
                    Evaluasi hasil tryout secara lebih mendalam melalui
                    pembahasan soal dan analisis waktu.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {FEATURES.map((feature) => {
                    const Icon = feature.icon

                    return (
                        <article
                            key={feature.path}
                            className="card-lift flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft hover:border-primary/50 sm:p-6"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                                <Icon size={24} aria-hidden="true" />
                            </div>

                            <h3 className="text-[17px] font-bold text-foreground">
                                {feature.title}
                            </h3>

                            <p className="mt-2 flex-1 text-[14px] leading-6 text-muted-foreground">
                                {feature.description}
                            </p>

                            <Link
                                to={`/user/results/${attemptId}/${feature.path}`}
                                className="focus-ring mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-700 px-4 text-[14px] font-semibold text-white transition hover:bg-primary-700/90"
                            >
                                Lihat Detail
                                <ArrowRight size={18} aria-hidden="true" />
                            </Link>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}

export default AdvancedAnalysisCard