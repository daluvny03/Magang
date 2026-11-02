import { CheckCircle2, Clock3, Gauge, Hourglass, Zap } from 'lucide-react'

import StatCard from '@/user/components/common/StatCard'
import { formatDuration } from '@/utils/format'

const percentOf = (count, total) =>
  total > 0 ? Math.round((count / total) * 100) : 0

function TimeSummaryCards({
  durationSeconds,
  recordedSeconds,
  averageSeconds,
  validTimeCount,
  counts,
}) {
  const total = counts.total

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          className="lg:col-span-3"
          icon={Clock3}
          tone="primary"
          label="Waktu Pengerjaan Paket"
          value={formatDuration(durationSeconds)}
          hint={`Waktu tercatat per soal: ${formatDuration(recordedSeconds)}`}
        />

        <StatCard
          className="lg:col-span-3"
          icon={Gauge}
          tone="info"
          label="Rata-rata per Soal"
          value={formatDuration(averageSeconds)}
          hint={`Dari ${validTimeCount} soal dengan waktu valid`}
        />

        <StatCard
          className="lg:col-span-2"
          icon={Zap}
          tone="info"
          label="Soal Dikerjakan Cepat"
          value={counts.relatively_fast}
          suffix="soal"
          hint={`${percentOf(counts.relatively_fast, total)}% dari ${total} soal`}
        />

        <StatCard
          className="lg:col-span-2"
          icon={CheckCircle2}
          tone="success"
          label="Soal Dikerjakan Normal"
          value={counts.normal}
          suffix="soal"
          hint={`${percentOf(counts.normal, total)}% dari ${total} soal`}
        />

        <StatCard
          className="sm:max-lg:col-span-2 lg:col-span-2"
          icon={Hourglass}
          tone="warning"
          label="Soal Dikerjakan Lambat"
          value={counts.relatively_slow}
          suffix="soal"
          hint={`${percentOf(counts.relatively_slow, total)}% dari ${total} soal`}
        />
      </div>

      {counts.insufficient_data > 0 && (
        <p className="text-[14px] leading-6 text-muted-foreground">
          {counts.insufficient_data} soal belum bisa dinilai karena data waktu
          tidak cukup, jadi tidak masuk hitungan cepat, normal, atau lambat.
        </p>
      )}
    </div>
  )
}

export default TimeSummaryCards