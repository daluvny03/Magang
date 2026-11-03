import { Award, BookOpenCheck, ShieldCheck, TrendingUp } from 'lucide-react'

import StatCard from '@/user/components/common/StatCard'
import { formatNumber } from '@/utils/format'

function SummaryCards({ summary }) {
  const passed = summary.passedAttempts ?? 0
  const evaluated = passed + (summary.failedAttempts ?? 0)
  const notEvaluated = summary.notEvaluatedAttempts ?? 0

  return (
    <section aria-labelledby="summary-cards-title">
      <h2 id="summary-cards-title" className="sr-only">
        Ringkasan performa
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BookOpenCheck}
          tone="primary"
          label="Total Tryout Selesai"
          value={formatNumber(summary.totalAttempts)}
          suffix="tryout"
          hint="Seluruh pengerjaan yang sudah kamu selesaikan"
        />

        <StatCard
          icon={TrendingUp}
          tone="info"
          label="Rata-rata Pencapaian"
          value={formatNumber(summary.averageScorePercentage)}
          suffix="%"
          hint="Dari semua tryout yang sudah selesai"
        />

        <StatCard
          icon={Award}
          tone="warning"
          label="Pencapaian Terbaik"
          value={formatNumber(summary.bestScorePercentage)}
          suffix="%"
          hint="Capaian terbaikmu sejauh ini"
        />

        <StatCard
          icon={ShieldCheck}
          tone="success"
          label="Memenuhi Passing Grade"
          value={formatNumber(passed)}
          suffix={`dari ${formatNumber(evaluated)}`}
          hint={
            notEvaluated > 0
              ? `${formatNumber(notEvaluated)} tryout tanpa passing grade tidak dihitung`
              : 'Tryout yang dinilai dengan passing grade'
          }
        />
      </div>
    </section>
  )
}

export default SummaryCards