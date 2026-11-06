import {
  ChartNoAxesColumn,
  ClipboardCheck,
  Clock3,
} from 'lucide-react'

import {
  formatDuration,
  formatNumber,
  formatPercentage,
} from '@/utils/format'

function SummaryMetric({ icon: Icon, label, value, description, className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-muted/50 p-4 sm:p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon size={20} aria-hidden="true" />
        </span>

        <dt className="text-[14px] font-medium text-muted-foreground">
          {label}
        </dt>
      </div>

      <dd className="mt-3">
        <span className="block break-words text-[26px] font-bold leading-tight text-foreground">
          {value}
        </span>

        <span className="mt-1.5 block text-[13px] leading-5 text-muted-foreground">
          {description}
        </span>
      </dd>
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
      value: formatPercentage(summary.scorePercentage),
      description:
        `${formatNumber(summary.totalScore)} dari ` +
        `${formatNumber(summary.maximumScore)} poin`,
    },
    {
      key: 'completion',
      icon: ClipboardCheck,
      label: 'Penyelesaian',
      value: formatPercentage(summary.completionPercentage),
      description:
        `${formatNumber(summary.answered)} dari ` +
        `${formatNumber(summary.totalQuestions)} soal`,
    },
    {
      key: 'duration',
      icon: Clock3,
      label: 'Durasi Ujian',
      value: formatDuration(summary.durationSeconds),
      description: 'Waktu sejak mulai hingga ujian selesai',
    },
  ]

  return (
    <section
      aria-labelledby="analysis-summary-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
    >
      <div className="mb-5">
        <h3
          id="analysis-summary-title"
          className="text-[17px] font-bold text-foreground"
        >
          Ringkasan Analisis
        </h3>

        <p className="mt-1 text-[14px] text-muted-foreground">
          Gambaran performa selama mengerjakan simulasi CAT.
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <SummaryMetric
            key={metric.key}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            description={metric.description}
            // di 640-1023px tile terakhir mengisi dua kolom agar tidak sendirian
            className={index === metrics.length - 1 ? 'sm:max-lg:col-span-2' : ''}
          />
        ))}
      </dl>
    </section>
  )
}

export default AnalysisSummary
