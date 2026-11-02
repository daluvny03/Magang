import { Award, ShieldAlert, ShieldCheck } from 'lucide-react'

import {
  CATEGORY_ORDER,
  CATEGORY_STYLES,
} from '@/user/constants/categoryStyles'
import { formatNumber } from '@/utils/format'

const clampPercent = (value) => Math.min(100, Math.max(0, value))

function toViewModel(category, maxBySlug) {
  const slug = String(category.slug ?? '')
  const score = Number(category.totalScore) || 0
  const max = maxBySlug[slug]
  const hasMax = Number.isFinite(max) && max > 0
  const hasPassing = category.passingGrade != null
  const passing = hasPassing ? Number(category.passingGrade) || 0 : null

  return {
    ...category,
    slug,
    label: slug.toUpperCase(),
    score,
    max: hasMax ? max : null,
    passing,
    hasPassing,
    scorePercent: hasMax ? clampPercent((score / max) * 100) : null,
    passingPercent:
      hasMax && hasPassing ? clampPercent((passing / max) * 100) : null,
    difference: hasPassing ? score - passing : null,
  }
}

function CategoryRow({ item }) {
  const isTKP = item.slug === 'tkp'

  const style = CATEGORY_STYLES[item.slug] ?? {
    label: item.name ?? item.label,
    badge: 'bg-muted text-muted-foreground',
  }

  const passed = item.passed === true

  const answerStats = isTKP
    ? [
        { label: 'Terjawab', value: `${formatNumber(item.answered)}/${formatNumber(item.totalQuestions)}` },
        { label: 'Kosong', value: formatNumber(item.unanswered) },
      ]
    : [
        { label: 'Benar', value: formatNumber(item.correctAnswers) },
        { label: 'Salah', value: formatNumber(item.wrongAnswers) },
        { label: 'Kosong', value: formatNumber(item.unanswered) },
      ]

  return (
    <article className="rounded-2xl border border-border p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3>
              <span
                className={`inline-flex rounded-lg px-3 py-1 text-[15px] font-bold ${style.badge}`}
              >
                {item.label}
              </span>
            </h3>

            {item.hasPassing && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${
                  passed
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {passed ? (
                  <ShieldCheck size={15} aria-hidden="true" />
                ) : (
                  <ShieldAlert size={15} aria-hidden="true" />
                )}
                {passed ? 'Lolos' : 'Belum Lolos'}
              </span>
            )}
          </div>

          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {style.label} · {formatNumber(item.totalQuestions)} soal
          </p>
        </div>

        <div className="text-right">
          <p className="text-[26px] font-bold leading-none text-foreground">
            {formatNumber(item.score)}
            {item.max != null && (
              <span className="text-[15px] font-semibold text-muted-foreground">
                {' '}
                / {formatNumber(item.max)}
              </span>
            )}
          </p>

          <p className="mt-1 text-[13px] text-muted-foreground">
            {item.hasPassing
              ? `skor minimal ${formatNumber(item.passing)}`
              : 'tanpa skor minimal'}
          </p>
        </div>
      </div>

      {item.scorePercent != null && (
        <div className="relative mt-5 h-3 w-full rounded-full bg-muted">
          <div
            role="progressbar"
            aria-label={`Skor ${item.label}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(item.scorePercent)}
            className={`h-3 rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${
              item.hasPassing && !passed ? 'bg-destructive' : 'bg-success'
            }`}
            style={{ width: `${item.scorePercent}%` }}
          />

          {item.passingPercent != null && (
            <span
              aria-hidden="true"
              className="absolute -top-1 h-5 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
              style={{ left: `${item.passingPercent}%` }}
            />
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        {item.difference != null && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
              passed
                ? 'bg-emerald-50 text-emerald-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {item.difference > 0 ? '+' : ''}
            {formatNumber(item.difference)}{' '}
            {item.difference >= 0 ? 'di atas' : 'di bawah'} minimal
          </span>
        )}

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          {answerStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5">
              <dt>{stat.label}</dt>
              <dd className="font-semibold text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  )
}

function CategoryBreakdown({ categories = [], analysisCategories = [] }) {
  const maxBySlug = Object.fromEntries(
    analysisCategories.map((category) => [
      category.slug,
      Number(category.maximumScore),
    ])
  )

  const items = [...categories]
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug)
    )
    .map((category) => toViewModel(category, maxBySlug))

  const failedLabels = items
    .filter((item) => item.hasPassing && item.passed === false)
    .map((item) => item.label)

  return (
    <section
      aria-labelledby="category-result-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
    >
      <div className="flex items-center gap-2">
        <Award size={20} aria-hidden="true" className="text-primary-700" />

        <h2
          id="category-result-heading"
          className="text-[19px] font-bold text-foreground"
        >
          Hasil per Kategori
        </h2>
      </div>

      <p className="mt-1 text-[14px] text-muted-foreground">
        Bar berwarna menunjukkan skormu, garis hitam menandai skor minimal.
      </p>

      {items.length > 0 ? (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <CategoryRow key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-muted/60 p-4 text-[14px] text-muted-foreground">
          Data hasil per kategori tidak tersedia.
        </p>
      )}

      {failedLabels.length > 0 && (
        <div
          role="note"
          className="mt-5 flex items-start gap-2.5 rounded-2xl bg-amber-50 px-4 py-3.5 text-[14px] leading-6 text-amber-900"
        >
          <ShieldAlert
            size={18}
            aria-hidden="true"
            className="mt-1 shrink-0"
          />

          <p>
            Kategori{' '}
            <strong>
              {new Intl.ListFormat('id-ID', {
                style: 'long',
                type: 'conjunction',
              }).format(failedLabels)}
            </strong>{' '}
            belum memenuhi skor minimal. Pada SKD, semua kategori wajib lolos
            skor minimalnya masing-masing.
          </p>
        </div>
      )}
    </section>
  )
}

export default CategoryBreakdown