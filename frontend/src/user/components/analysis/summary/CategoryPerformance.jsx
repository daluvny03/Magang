import { Info } from 'lucide-react'

import { CATEGORY_ORDER, CATEGORY_STYLES } from '@/user/constants/categoryStyles'
import { formatNumber, formatPercentage } from '@/utils/format'

const progressWidth = (value) => {
  const number = Number(value)

  if (value == null || !Number.isFinite(number)) return 0

  return Math.min(100, Math.max(0, number))
}

function MiniStat({ label, value, className = '' }) {
  return (
    <div className={`rounded-xl bg-muted/70 p-3.5 ${className}`}>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>

      <dd className="mt-1 text-[16px] font-bold text-foreground">{value}</dd>
    </div>
  )
}

function CategoryCard({ category }) {
  const isTKP = category.slug === 'tkp'
  const slug = String(category.slug ?? '').toUpperCase()

  const style = CATEGORY_STYLES[category.slug] ?? {
    label: category.name ?? slug,
    badge: 'bg-muted text-muted-foreground',
    progress: 'bg-muted-foreground',
  }

  return (
    <article className="rounded-2xl border border-border p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4>
            <span
              className={`inline-flex rounded-lg px-3 py-1 text-[15px] font-bold ${style.badge}`}
            >
              {slug}
            </span>
          </h4>

          <p className="mt-2 text-[14px] text-muted-foreground">
            {style.label}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[22px] font-bold leading-none text-foreground">
            {formatNumber(category.totalScore)}
            <span className="mx-1 text-muted-foreground">/</span>
            {formatNumber(category.maximumScore)}
          </p>

          <p className="mt-1 text-[13px] text-muted-foreground">
            Skor diperoleh
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between gap-2 text-[14px]">
            <span className="text-muted-foreground">Pencapaian Skor</span>

            <span className="font-semibold text-foreground">
              {formatPercentage(category.scorePercentage)}
            </span>
          </div>

          <div
            className="h-2.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={`Pencapaian skor ${slug}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              category.scorePercentage == null
                ? undefined
                : progressWidth(category.scorePercentage)
            }
          >
            <div
              className={`h-full rounded-full transition-all ${style.progress}`}
              style={{ width: `${progressWidth(category.scorePercentage)}%` }}
            />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniStat
            label="Soal Dijawab"
            value={`${formatNumber(category.answered)} / ${formatNumber(category.totalQuestions)}`}
          />

          <MiniStat
            label="Belum Dijawab"
            value={formatNumber(category.unanswered)}
          />

          <MiniStat
            label="Penyelesaian"
            value={formatPercentage(category.completionPercentage)}
            className="col-span-2 sm:col-span-1"
          />
        </dl>

        {!isTKP ? (
          <div className="rounded-xl border border-border p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[14px] text-muted-foreground">
                Akurasi Jawaban
              </span>

              <span className="text-[14px] font-semibold text-foreground">
                {formatPercentage(category.accuracyPercentage)}
              </span>
            </div>

            <p className="mt-2 text-[13px] text-muted-foreground">
              {formatNumber(category.correctAnswers)} benar,{' '}
              {formatNumber(category.wrongAnswers)} salah
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl border border-primary-200 bg-primary-50 p-3.5">
            <Info
              size={18}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-primary-700"
            />

            <p className="text-[14px] leading-6 text-primary-700">
              Penilaian TKP berdasarkan skor setiap pilihan jawaban, bukan
              benar atau salah.
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

function CategoryPerformance({ categories = [] }) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return null
  }

  const sortedCategories = [...categories].sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug)
  )

  return (
    <section
      aria-labelledby="category-performance-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
    >
      <div className="mb-5">
        <h3
          id="category-performance-title"
          className="text-[17px] font-bold text-foreground"
        >
          Performa per Kategori
        </h3>

        <p className="mt-1 text-[14px] text-muted-foreground">
          Detail pencapaian hasil tryout pada setiap kategori SKD.
        </p>
      </div>

      <div className="space-y-4">
        {sortedCategories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </section>
  )
}

export default CategoryPerformance