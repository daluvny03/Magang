import { BookOpen, CheckCircle2, Clock3 } from 'lucide-react'

import { AccessBadge, StateChip } from './TryoutBadges'
import TryoutCover from './TryoutCover'
import TryoutPassingRules from './TryoutPassingRules'

function FactTile({ icon: Icon, label, children }) {
  return (
    <div className="rounded-2xl bg-muted/70 p-4">
      <dt className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
        <Icon size={18} aria-hidden="true" />
        {label}
      </dt>

      <dd className="mt-2 text-[15px] font-bold text-foreground">{children}</dd>
    </div>
  )
}

function TryoutInfoCard({ tryout, stateKey }) {
  return (
    <section
      aria-labelledby="tryout-detail-title"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
    >
      <TryoutCover stateKey={stateKey} className="h-28">
        <div className="flex h-full max-w-full flex-col items-start justify-between p-4 sm:px-6">
          <AccessBadge tryout={tryout} onCover />
          <StateChip stateKey={stateKey} onCover />
        </div>
      </TryoutCover>

      <div className="p-5 sm:p-6">
        <h1
          id="tryout-detail-title"
          className="text-[24px] font-bold leading-tight text-foreground sm:text-[28px]"
        >
          {tryout.name}
        </h1>

        <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          {tryout.description ||
            'Simulasi tryout untuk membantu persiapan seleksi CPNS.'}
        </p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <FactTile icon={Clock3} label="Durasi">
            {tryout.durationMinutes} menit
          </FactTile>

          <FactTile icon={BookOpen} label="Jumlah Soal">
            {tryout.questionCount} soal
          </FactTile>

          <FactTile icon={CheckCircle2} label="Passing Score">
            <TryoutPassingRules tryout={tryout} />
          </FactTile>
        </dl>
      </div>
    </section>
  )
}

export default TryoutInfoCard