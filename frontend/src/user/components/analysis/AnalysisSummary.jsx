
import {
  ChartNoAxesColumn,
  ClipboardCheck,
  Clock3,
  Timer,
} from 'lucide-react'

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

const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return '—'
  }

  return `${formatNumber(value)}%`
}

const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) {
    return '—'
  }

  const totalSeconds = Number(seconds)

  if (
    !Number.isFinite(totalSeconds) ||
    totalSeconds < 0
  ) {
    return '—'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = Math.floor(totalSeconds % 60)

  if (minutes === 0) {
    return `${remainingSeconds} detik`
  }

  if (remainingSeconds === 0) {
    return `${minutes} menit`
  }

  return `${minutes} m ${remainingSeconds} d`
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-500">
        <Icon size={18} aria-hidden="true" />

        <span className="text-xs font-medium sm:text-sm">
          {label}
        </span>
      </div>

      <p className="break-words text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  )
}

function AnalysisSummary({ summary }) {
  if (!summary) return null

  const metrics = [
    {
      key: 'score',
      icon: ChartNoAxesColumn,
      label: 'Pencapaian Skor',
      value: formatPercentage(
        summary.scorePercentage
      ),
      description:
        `${formatNumber(summary.totalScore)} dari ` +
        `${formatNumber(summary.maximumScore)} poin`,
    },
    {
      key: 'completion',
      icon: ClipboardCheck,
      label: 'Penyelesaian',
      value: formatPercentage(
        summary.completionPercentage
      ),
      description:
        `${formatNumber(summary.answered)} dari ` +
        `${formatNumber(summary.totalQuestions)} soal`,
    },
    {
      key: 'duration',
      icon: Clock3,
      label: 'Durasi Ujian',
      value: formatDuration(
        summary.durationSeconds
      ),
      description:
        'Waktu sejak mulai hingga ujian selesai',
    },
    {
      key: 'recorded',
      icon: Timer,
      label: 'Waktu Tercatat',
      value: formatDuration(
        summary.recordedTimeSeconds
      ),
      description:
        'Akumulasi waktu per soal yang tercatat sistem',
    },
  ]

  return (
    <section
      aria-labelledby="analysis-summary-title"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <h2
          id="analysis-summary-title"
          className="text-lg font-semibold text-slate-900"
        >
          Ringkasan Analisis
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Gambaran performa selama mengerjakan
          simulasi CAT.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {metrics.map((metric) => (
          <SummaryMetric
            key={metric.key}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            description={metric.description}
          />
        ))}
      </div>
    </section>
  )
}

export default AnalysisSummary
