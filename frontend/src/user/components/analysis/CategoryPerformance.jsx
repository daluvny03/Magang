
const CATEGORY_ORDER = ['twk', 'tiu', 'tkp']

const CATEGORY_LABELS = {
  twk: 'Tes Wawasan Kebangsaan',
  tiu: 'Tes Intelegensia Umum',
  tkp: 'Tes Karakteristik Pribadi',
}

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return '—'
  }

  const number = Number(value)

  if (!Number.isFinite(number)) {
    return '—'
  }

  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(number)
}

const formatPercentage = (value) =>
  value == null ? '—' : `${formatNumber(value)}%`

const progressWidth = (value) => {
  const number = Number(value)

  if (value == null || !Number.isFinite(number)) {
    return 0
  }

  return Math.min(100, Math.max(0, number))
}

function CategoryCard({ category }) {
  const isTKP = category.slug === 'tkp'

  const categoryName =
    CATEGORY_LABELS[category.slug] ??
    category.name ??
    category.slug.toUpperCase()

  return (
    <article className="rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {category.slug.toUpperCase()}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {categoryName}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-slate-900">
            {formatNumber(category.totalScore)}
            <span className="mx-1 text-slate-400">/</span>
            {formatNumber(category.maximumScore)}
          </p>

          <p className="text-xs text-slate-500">
            Skor diperoleh
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-2 flex justify-between gap-2 text-sm">
            <span className="text-slate-600">
              Pencapaian Skor
            </span>

            <span className="font-semibold text-slate-900">
              {formatPercentage(
                category.scorePercentage
              )}
            </span>
          </div>

          <div
            className="h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label={`Pencapaian skor ${category.slug.toUpperCase()}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              category.scorePercentage == null
                ? undefined
                : progressWidth(category.scorePercentage)
            }
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${progressWidth(
                  category.scorePercentage
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">
              Soal Dijawab
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {formatNumber(category.answered)}
              {' / '}
              {formatNumber(category.totalQuestions)}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">
              Belum Dijawab
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {formatNumber(category.unanswered)}
            </p>
          </div>

          <div className="col-span-2 rounded-lg bg-slate-50 p-3 sm:col-span-1">
            <p className="text-xs text-slate-500">
              Penyelesaian
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {formatPercentage(
                category.completionPercentage
              )}
            </p>
          </div>
        </div>

        {!isTKP ? (
          <div className="rounded-lg border border-slate-100 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-slate-600">
                Akurasi Jawaban
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {formatPercentage(
                  category.accuracyPercentage
                )}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {formatNumber(category.correctAnswers)} benar,
              {' '}
              {formatNumber(category.wrongAnswers)} salah
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-sm text-blue-900">
              Penilaian TKP berdasarkan skor setiap
              pilihan jawaban, bukan benar atau salah.
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
      CATEGORY_ORDER.indexOf(a.slug) -
      CATEGORY_ORDER.indexOf(b.slug)
  )

  return (
    <section
      aria-labelledby="category-performance-title"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <h2
          id="category-performance-title"
          className="text-lg font-semibold text-slate-900"
        >
          Performa per Kategori
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Detail pencapaian hasil tryout pada
          setiap kategori SKD.
        </p>
      </div>

      <div className="space-y-4">
        {sortedCategories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
          />
        ))}
      </div>
    </section>
  )
}

export default CategoryPerformance
