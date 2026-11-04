import { Crown, Lock, Play, ShieldCheck } from 'lucide-react'

import { buttonClass } from '@/user/components/common/buttonStyles'

function LockedNotice({ allowedTiers = [], onViewSubscription }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-muted/50 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-foreground">
          <Lock size={18} aria-hidden="true" />

          <p className="text-[15px] font-bold">Tryout Terkunci</p>
        </div>

        <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
          Kamu memerlukan subscription yang memiliki akses ke paket tryout ini.
        </p>

        {allowedTiers.length > 0 && (
          <div className="mt-4">
            <p className="text-[13px] font-semibold text-foreground">
              Subscription yang memiliki akses langsung:
            </p>

            <ul className="mt-2 flex flex-wrap gap-2">
              {allowedTiers.map((tier) => (
                <li
                  key={tier.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[13px] font-semibold text-amber-800"
                >
                  <Crown size={14} aria-hidden="true" />
                  {tier.name}
                </li>
              ))}
            </ul>

            <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
              Subscription lain yang mewarisi tier tersebut juga dapat memiliki
              akses.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onViewSubscription}
        className={`${buttonClass.solidLg} w-full`}
      >
        <Lock size={18} aria-hidden="true" />
        Lihat Subscription
      </button>
    </div>
  )
}

function TryoutStartPanel({
  tryout,
  hasActiveAttempt,
  canStartOrResume,
  scheduleLabel,
  isPending,
  isFetching,
  errorMessage,
  onStart,
  onViewSubscription,
}) {
  const steps = [
    'Pastikan koneksi internet dalam kondisi stabil selama pengerjaan.',
    <>
      Siapkan waktu sekitar{' '}
      <strong>{tryout.durationMinutes} menit</strong> untuk menyelesaikan
      tryout.
    </>,
    <>
      Tryout terdiri dari <strong>{tryout.questionCount} soal</strong>.
    </>,
    'Waktu pengerjaan berjalan setelah tryout dimulai dan tetap berjalan meskipun kamu meninggalkan halaman ujian.',
    'Pastikan semua jawaban sudah diperiksa sebelum menyelesaikan tryout.',
  ]

  const startLabel = isPending
    ? hasActiveAttempt
      ? 'Melanjutkan...'
      : 'Memulai...'
    : hasActiveAttempt
      ? 'Lanjutkan Tryout'
      : 'Mulai Tryout'

  return (
    <section
      aria-labelledby="tryout-prepare-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"
        >
          <ShieldCheck size={22} />
        </span>

        <div>
          <h2
            id="tryout-prepare-title"
            className="text-[19px] font-bold text-foreground"
          >
            Sebelum Memulai
          </h2>

          <p className="mt-1 text-[14px] text-muted-foreground">
            Pastikan kamu sudah siap sebelum memulai pengerjaan tryout.
          </p>
        </div>
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li
            key={index}
            className="flex gap-3 text-[15px] leading-7 text-foreground"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[13px] font-bold text-primary-700"
            >
              {index + 1}
            </span>

            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 border-t border-border pt-5">
        {errorMessage && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-red-50 p-4 text-[14px] leading-6 text-red-800"
          >
            {errorMessage}
          </p>
        )}

        {canStartOrResume ? (
          <button
            type="button"
            onClick={onStart}
            disabled={isPending || isFetching}
            className={`${buttonClass.solidLg} w-full`}
          >
            <Play size={18} aria-hidden="true" />
            {startLabel}
          </button>
        ) : !tryout.isAccessible ? (
          <LockedNotice
            allowedTiers={tryout.allowedTiers}
            onViewSubscription={onViewSubscription}
          />
        ) : (
          <button
            type="button"
            disabled
            className={`${buttonClass.outlineLg} w-full`}
          >
            {scheduleLabel}
          </button>
        )}
      </div>
    </section>
  )
}

export default TryoutStartPanel