
import {
  AlertCircle,
  Clock3,
  Gauge,
  Info,
  Timer,
} from 'lucide-react'

const STATUS_CONFIG = {
  relatively_slow: {
    label: 'Relatif Lambat',
    Icon: AlertCircle,
    badgeClass: 'bg-amber-100 text-amber-800',
    panelClass: 'border-amber-200 bg-amber-50',
  },
  normal: {
    label: 'Normal',
    Icon: Gauge,
    badgeClass: 'bg-emerald-100 text-emerald-800',
    panelClass: 'border-emerald-200 bg-emerald-50',
  },
  relatively_fast: {
    label: 'Relatif Cepat',
    Icon: Timer,
    badgeClass: 'bg-blue-100 text-blue-800',
    panelClass: 'border-blue-200 bg-blue-50',
  },
  insufficient_data: {
    label: 'Data Tidak Cukup',
    Icon: Info,
    badgeClass: 'bg-slate-100 text-slate-700',
    panelClass: 'border-slate-200 bg-slate-50',
  },
}

const formatDuration = (value) => {
  if (value === null || value === undefined) {
    return '—'
  }

  const seconds = Number(value)

  if (!Number.isFinite(seconds) || seconds < 0) {
    return '—'
  }

  const rounded = Math.round(seconds)
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const remaining = rounded % 60

  if (hours > 0) {
    return `${hours}j ${minutes}m ${remaining}d`
  }

  if (minutes > 0) {
    return `${minutes}m ${remaining}d`
  }

  return `${remaining} detik`
}

const formatRatio = (value) => {
  if (value === null || value === undefined) {
    return '—'
  }

  const number = Number(value)

  if (!Number.isFinite(number) || number < 0) {
    return '—'
  }

  return `${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(number)}×`
}

function TimeMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">
        {value}
      </p>
    </div>
  )
}

function QuestionTimeInsight({ question }) {
  const data = question?.timeInsight

  const hasInsight =
    data &&
    typeof data === 'object' &&
    STATUS_CONFIG[data.status]

  const status = hasInsight
    ? data.status
    : 'insufficient_data'

  const config = STATUS_CONFIG[status]
  const StatusIcon = config.Icon

  const recordedSeconds =
    data?.recordedTimeSeconds ??
    question?.recordedTimeSeconds ??
    null

  const averageSeconds =
    status === 'insufficient_data'
      ? null
      : data?.categoryAverageSeconds

  const timeRatio =
    status === 'insufficient_data'
      ? null
      : data?.timeRatio

  const insightMessage =
    typeof data?.insight?.message === 'string'
      ? data.insight.message
      : 'Data waktu belum cukup untuk memberikan analisis.'

  const categoryLabel =
    String(question?.categorySlug ?? '').toUpperCase()

  return (
    <section
      aria-label={`Analisis waktu soal ${question.questionOrder}`}
      className={`rounded-xl border p-4 sm:p-5 ${config.panelClass}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock3
            size={19}
            className="text-slate-700"
            aria-hidden="true"
          />

          <h3 className="text-sm font-bold text-slate-900 sm:text-base">
            Analisis Waktu Pengerjaan
          </h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}
        >
          <StatusIcon
            size={14}
            aria-hidden="true"
          />

          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TimeMetric
          label="Waktu Soal"
          value={formatDuration(recordedSeconds)}
        />

        <TimeMetric
          label={`Rata-rata ${categoryLabel}`}
          value={formatDuration(averageSeconds)}
        />

        <TimeMetric
          label="Rasio Waktu"
          value={formatRatio(timeRatio)}
        />
      </div>

      <div className="mt-4 rounded-lg border border-white/70 bg-white/70 p-3">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          Insight Pengerjaan
        </p>

        <p className="text-sm leading-relaxed text-slate-700">
          {insightMessage}
        </p>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Perbandingan menggunakan waktu yang tercatat
        pada kategori yang sama. Hasil ini merupakan
        indikator evaluasi, bukan batas waktu resmi CAT.
      </p>
    </section>
  )
}

export default QuestionTimeInsight
