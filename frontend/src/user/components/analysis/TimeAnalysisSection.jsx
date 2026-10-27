
import { useMemo, useState } from 'react'
import {
  ChevronDown,
  Clock3,
  Gauge,
  Timer,
  AlertCircle,
} from 'lucide-react'

import QuestionTimeInsight from './QuestionTimeInsight'

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'twk', label: 'TWK' },
  { value: 'tiu', label: 'TIU' },
  { value: 'tkp', label: 'TKP' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'relatively_fast', label: 'Relatif Cepat' },
  { value: 'normal', label: 'Normal' },
  { value: 'relatively_slow', label: 'Relatif Lambat' },
]

const STATUS_STYLES = {
  relatively_fast: {
    label: 'Relatif Cepat',
    className: 'bg-blue-50 text-blue-700',
  },
  normal: {
    label: 'Normal',
    className: 'bg-green-50 text-green-700',
  },
  relatively_slow: {
    label: 'Relatif Lambat',
    className: 'bg-amber-50 text-amber-700',
  },
  insufficient_data: {
    label: 'Data Tidak Cukup',
    className: 'bg-slate-100 text-slate-600',
  },
}

const formatDuration = (value) => {
  if (value == null) return '—'

  const seconds = Number(value)

  if (!Number.isFinite(seconds) || seconds < 0) {
    return '—'
  }

  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remaining = total % 60

  if (hours > 0) {
    return `${hours}j ${minutes}m ${remaining}d`
  }

  if (minutes > 0) {
    return `${minutes}m ${remaining}d`
  }

  return `${remaining} detik`
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={18} aria-hidden="true" />
        <span className="text-sm">{label}</span>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  )
}

function CategoryTimeSummary({ categories = [] }) {
  if (!categories.length) return null

  const sorted = [...categories].sort(
    (a, b) =>
      ['twk', 'tiu', 'tkp'].indexOf(a.slug) -
      ['twk', 'tiu', 'tkp'].indexOf(b.slug)
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Ringkasan Waktu Per Kategori
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Statistik durasi pengerjaan berdasarkan kategori ujian.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {sorted.map((item) => (
          <article
            key={item.slug}
            className="rounded-xl border border-slate-200 p-4"
          >
            <h3 className="font-semibold uppercase text-slate-900">
              {item.slug}
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">
                  Total Waktu
                </span>
                <span className="font-semibold text-slate-900">
                  {formatDuration(item.recordedTimeSeconds)}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-slate-500">
                  Rata-rata
                </span>
                <span className="font-semibold text-slate-900">
                  {item.hasSufficientData
                    ? formatDuration(item.averageTimeSeconds)
                    : '—'}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-slate-500">
                  Data Valid
                </span>
                <span className="font-semibold text-slate-900">
                  {item.validTimeCount ?? 0}
                  {' / '}
                  {item.totalQuestions ?? 0}
                </span>
              </div>
            </div>

            {!item.hasSufficientData && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
                Data belum cukup untuk menghitung
                rata-rata kategori.
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function TimeAnalysisSection({
  questions = [],
  timeAnalysis,
  summary,
}) {
  const [category, setCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)

  const safeQuestions = Array.isArray(questions)
    ? questions
    : []

  const filteredQuestions = useMemo(() => {
    return [...safeQuestions]
      .sort(
        (a, b) =>
          Number(a.questionOrder) -
          Number(b.questionOrder)
      )
      .filter((question) => {
        const matchCategory =
          category === 'all' ||
          question.categorySlug === category

        const matchStatus =
          statusFilter === 'all' ||
          (question.timeInsight?.status ??
            'insufficient_data') === statusFilter

        return matchCategory && matchStatus
      })
  }, [questions, category, statusFilter])

  const selectedQuestion = filteredQuestions.find(
    (question) =>
      String(question.questionId) ===
      String(selectedQuestionId)
  )

  const totalRecordedSeconds =
    summary?.recordedTimeSeconds ?? null

  const validTimeCount =
    timeAnalysis?.summary?.questionsWithValidTime ?? 0

  const averageSeconds =
    validTimeCount > 0 &&
    totalRecordedSeconds != null
      ? Number(totalRecordedSeconds) / validTimeCount
      : null

  const slowQuestionCount =
    timeAnalysis?.summary?.slowQuestionCount ?? 0

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Clock3}
          label="Total Waktu Tercatat"
          value={formatDuration(totalRecordedSeconds)}
        />

        <MetricCard
          icon={Timer}
          label="Rata-rata per Soal (Semua Kategori)"
          value={formatDuration(averageSeconds)}
        />

        <MetricCard
          icon={Gauge}
          label="Soal dengan Waktu Valid"
          value={`${validTimeCount} / ${timeAnalysis?.summary?.totalQuestions ?? safeQuestions.length}`}
        />

        <MetricCard
          icon={AlertCircle}
          label="Soal Relatif Lambat"
          value={slowQuestionCount}
        />
      </section>

      <p className="text-sm text-slate-500">
        Rata-rata keseluruhan dihitung dari total waktu tercatat dibagi jumlah
        soal dengan waktu valid, dari semua kategori. Soal tanpa waktu valid
        tidak dihitung. Rincian per kategori ditampilkan di bawah.
      </p>

      <CategoryTimeSummary
        categories={timeAnalysis?.categories ?? []}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Waktu Pengerjaan Per Soal
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Pilih soal untuk melihat rincian dan insight
            waktu pengerjaan.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setCategory(option.value)
                setSelectedQuestionId(null)
              }}
              aria-pressed={category === option.value}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                category === option.value
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label
            htmlFor="time-status-filter"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Filter Status Waktu
          </label>

          <select
            id="time-status-filter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setSelectedQuestionId(null)
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 sm:max-w-xs"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-5 text-sm text-slate-500">
          Menampilkan {filteredQuestions.length} dari{' '}
          {safeQuestions.length} soal
        </p>

        <div className="mt-4 space-y-3">
          {filteredQuestions.map((question) => {
            const isSelected =
              String(selectedQuestionId) ===
              String(question.questionId)

            const status =
              question.timeInsight?.status ??
              'insufficient_data'

            const config =
              STATUS_STYLES[status] ??
              STATUS_STYLES.insufficient_data

            return (
              <article
                key={question.questionId}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedQuestionId(
                      isSelected ? null : question.questionId
                    )
                  }
                  aria-expanded={isSelected}
                  className="flex w-full flex-wrap items-center gap-3 p-4 text-left transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      Soal {question.questionOrder}
                    </p>

                    <p className="mt-1 text-xs uppercase text-slate-500">
                      {question.categorySlug}
                      {' • '}
                      {formatDuration(
                        question.timeInsight?.recordedTimeSeconds ??
                        question.recordedTimeSeconds
                      )}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
                  >
                    {config.label}
                  </span>

                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`text-slate-500 transition ${
                      isSelected ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isSelected && selectedQuestion && (
                  <div className="border-t border-slate-200 p-3 sm:p-4">
                    <QuestionTimeInsight
                      question={selectedQuestion}
                    />
                  </div>
                )}
              </article>
            )
          })}

          {filteredQuestions.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-500">
                Tidak ada soal yang sesuai dengan filter.
              </p>
            </div>
          )}
        </div>
      </section>

      <p className="text-xs leading-relaxed text-slate-500">
        Analisis waktu menggunakan data pengerjaan yang
        tercatat. Kategori kecepatan bersifat relatif terhadap
        soal dalam kategori yang sama, bukan standar waktu
        resmi ujian CAT.
      </p>
    </div>
  )
}

export default TimeAnalysisSection
