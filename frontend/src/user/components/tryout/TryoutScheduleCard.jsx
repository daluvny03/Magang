import { Timer } from 'lucide-react'

import { SCHEDULE_TO_STATE } from '@/user/constants/tryoutState'
import { formatScheduleDate } from '@/user/utils/tryoutDisplay'

import { StateChip } from './TryoutBadges'

function TryoutScheduleCard({ tryout, scheduleStatus, hasActiveAttempt }) {
  const stateKey = SCHEDULE_TO_STATE[scheduleStatus]

  return (
    <section
      aria-labelledby="tryout-schedule-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="tryout-schedule-title"
          className="text-[19px] font-bold text-foreground"
        >
          Jadwal Mulai Tryout
        </h2>

        {stateKey ? (
          <StateChip stateKey={stateKey} />
        ) : (
          <span className="rounded-full bg-muted px-3 py-1 text-[13px] font-semibold text-muted-foreground">
            Jadwal belum tersedia
          </span>
        )}
      </div>

      <dl className="mt-4 grid gap-4 text-[14px] sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Mulai tersedia</dt>

          <dd className="mt-1 font-semibold text-foreground">
            {formatScheduleDate(tryout.startAt, 'Tanpa batas awal')}
          </dd>
        </div>

        <div>
          <dt className="text-muted-foreground">Batas memulai ujian baru</dt>

          <dd className="mt-1 font-semibold text-foreground">
            {formatScheduleDate(tryout.endAt, 'Tanpa batas akhir')}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-[14px] leading-6 text-muted-foreground">
        Jadwal membatasi waktu memulai ujian baru. Ujian yang sudah dimulai tetap
        mendapat durasi penuh.
      </p>

      {hasActiveAttempt && (
        <div className="mt-4 flex gap-3 rounded-2xl bg-primary-50 p-4 text-[14px] leading-6 text-primary-700">
          <Timer size={20} aria-hidden="true" className="mt-0.5 shrink-0" />

          <p>
            Kamu memiliki ujian yang masih berlangsung. Segera kembali ke ujian
            karena timer tetap berjalan meskipun kamu meninggalkan halaman ujian.
            Batas waktu ujian:{' '}
            {formatScheduleDate(tryout.activeAttempt?.expiresAt, 'belum tersedia')}.
          </p>
        </div>
      )}
    </section>
  )
}

export default TryoutScheduleCard