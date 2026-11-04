import { CalendarClock, Crown, Sparkles } from 'lucide-react'

import Surface from '@/user/components/common/Surface'
import { buttonClass } from '@/user/components/common/buttonStyles'
import { getDaysLeft } from '@/user/utils/billing'
import { formatSubscriptionDate } from '@/user/utils/subscription-date'
import { prefersReducedMotion } from '@/utils/motion'

const FADE_MASK = 'linear-gradient(to bottom left, black 5%, transparent 70%)'

const scrollToPlans = () => {
  document.getElementById('daftar-paket')?.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  })
}

function CurrentSubscriptionCard({ subscription, hasActivePaid }) {
  if (!hasActivePaid) {
    return (
      <Surface
        as="section"
        aria-labelledby="current-subscription-title"
        className="p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700"
            >
              <Sparkles size={22} />
            </span>

            <div>
              <h2
                id="current-subscription-title"
                className="text-[17px] font-bold text-foreground"
              >
                Langganan Saya
              </h2>

              <p className="mt-1 max-w-xl text-[14px] leading-6 text-muted-foreground">
                Kamu sedang menggunakan paket Gratis. Upgrade untuk membuka
                pembahasan lengkap dan analisis waktu per soal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToPlans}
            className={`${buttonClass.solid} shrink-0`}
          >
            Lihat paket
          </button>
        </div>
      </Surface>
    )
  }

  const daysLeft = getDaysLeft(subscription.expiredAt)

  return (
    <section
      aria-labelledby="current-subscription-title"
      className="relative isolate overflow-hidden rounded-2xl border border-border bg-linear-to-br from-primary-50 via-card to-primary-100 p-6 shadow-soft sm:p-7"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 text-primary-700 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1.4px, transparent 1.8px)',
          backgroundSize: '18px 18px',
          maskImage: FADE_MASK,
          WebkitMaskImage: FADE_MASK,
        }}
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card text-amber-700 shadow-sm"
          >
            <Crown size={24} />
          </span>

          <div>
            <p className="text-[13px] font-semibold text-primary-700">
              Langganan Saya
            </p>

            <h2
              id="current-subscription-title"
              className="text-[22px] font-bold leading-tight text-foreground"
            >
              {subscription.tier.name} aktif
            </h2>

            <dl className="mt-2 space-y-1 text-[14px] text-muted-foreground">
              <div className="flex flex-wrap gap-x-2">
                <dt>Tanggal aktivasi:</dt>
                <dd className="font-semibold text-foreground">
                  {formatSubscriptionDate(subscription.startedAt)}
                </dd>
              </div>

              <div className="flex flex-wrap gap-x-2">
                <dt>Berlaku sampai:</dt>
                <dd className="font-semibold text-foreground">
                  {formatSubscriptionDate(subscription.expiredAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {daysLeft !== null && (
          <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-card px-4 py-2.5 text-[14px] font-semibold text-foreground shadow-sm sm:self-center">
            <CalendarClock size={18} aria-hidden="true" className="text-primary-700" />
            Sisa {daysLeft} hari
          </span>
        )}
      </div>
    </section>
  )
}

export default CurrentSubscriptionCard
