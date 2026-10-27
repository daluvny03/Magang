
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
            className="text-xl font-bold text-slate-900"
          >
            Analisis Lanjutan
          </h2>

          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <Crown size={14} aria-hidden="true" />
            Fitur Subscription
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Evaluasi hasil tryout secara lebih mendalam
          melalui pembahasan soal dan analisis waktu.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {FEATURES.map((feature) => {
          const Icon = feature.icon

          return (
            <article
              key={feature.path}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={24} aria-hidden="true" />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                {feature.description}
              </p>

              <Link
                to={`/user/results/${attemptId}/${feature.path}`}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Lihat Detail
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default AdvancedAnalysisCard
