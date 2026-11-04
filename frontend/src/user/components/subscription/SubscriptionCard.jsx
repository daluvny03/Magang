import { Check, Crown, Gift, LockKeyhole, Sparkles } from 'lucide-react'

import { buttonClass } from '@/user/components/common/buttonStyles'
import { formatPrice, formatTierDuration } from '@/user/utils/billing'

const ACTION_LABELS = {
  new: 'Beli Subscription',
  renewal: 'Perpanjang Subscription',
  upgrade: 'Upgrade Subscription',
}

const BLOCKED_LABELS = {
  inactive: 'Tidak Tersedia',
  free_tier: 'Paket Gratis',
  invalid_price: 'Tidak Tersedia',
  invalid_duration: 'Tidak Tersedia',
  upgrade_not_allowed: 'Tidak Dapat Beralih',
  subscription_conflict: 'Hubungi Administrator',
}

function SubscriptionCard({
  tier,
  isCurrentPlan = false,
  purchaseAction = null,
  isPurchasable = false,
  purchaseBlockReason = null,
  onCheckout,
  isCheckoutLoading = false,
}) {
  const isFree = tier.slug === 'free'
  const isFeatured = purchaseAction === 'upgrade'

  const canCheckout =
    !isFree &&
    isPurchasable &&
    Boolean(purchaseAction) &&
    typeof onCheckout === 'function'

  const durationLabel = formatTierDuration(tier.duration)

  const features = Array.isArray(tier.features)
    ? tier.features
        .map((feature) =>
          typeof feature === 'string' ? feature : feature?.featureText
        )
        .filter(Boolean)
    : []

  const buttonLabel = isCheckoutLoading
    ? 'Menyiapkan transaksi...'
    : ACTION_LABELS[purchaseAction] || 'Beli Subscription'

  const nameId = `tier-${tier.id}-name`
  const TierIcon = isFree ? Gift : Crown

  return (
    <article
      aria-labelledby={nameId}
      className={`relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-soft ${
        isCurrentPlan
          ? 'border-primary ring-1 ring-primary/40'
          : isFeatured
            ? 'border-amber-300'
            : 'border-border'
      }`}
    >
      {isCurrentPlan ? (
        <span className="absolute -top-3 left-6 rounded-full bg-primary-700 px-3 py-1 text-[13px] font-bold text-white">
          Paket saat ini
        </span>
      ) : isFeatured ? (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[13px] font-bold text-amber-900">
          <Sparkles size={13} aria-hidden="true" />
          Upgrade untuk kamu
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isFree ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
          }`}
        >
          <TierIcon size={22} />
        </span>

        <h3 id={nameId} className="text-[19px] font-bold text-foreground">
          {tier.name}
        </h3>
      </div>

      <div className="mt-5">
        <p className="text-[32px] font-bold leading-none text-foreground">
          {isFree ? 'Gratis' : formatPrice(tier.price)}
        </p>

        <p className="mt-2 text-[14px] text-muted-foreground">
          {isFree
            ? 'Akses gratis'
            : durationLabel
              ? `Berlaku ${durationLabel}`
              : 'Durasi tidak tersedia'}
        </p>
      </div>

      {tier.description && (
        <p className="mt-4 text-[14px] leading-6 text-muted-foreground">
          {tier.description}
        </p>
      )}

      <div className="my-5 h-px w-full bg-border" />

      <div>
        <h4 className="mb-3 text-[14px] font-bold text-foreground">
          Fitur dan benefit
        </h4>

        {features.length > 0 ? (
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li
                key={`${tier.id}-feature-${index}`}
                className="flex items-start gap-2.5 text-[14px] leading-6 text-foreground"
              >
                <Check
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-emerald-700"
                />

                <span>{feature}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-muted-foreground">
            Benefit paket belum tersedia.
          </p>
        )}
      </div>

      <div className="mt-auto pt-8">
        {canCheckout ? (
          <button
            type="button"
            onClick={onCheckout}
            disabled={isCheckoutLoading}
            className={`${buttonClass.solidLg} w-full`}
          >
            {buttonLabel}
          </button>
        ) : (
          <div className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-muted px-4 py-3 text-center text-[14px] font-semibold text-muted-foreground">
            {!isCurrentPlan && !isFree && (
              <LockKeyhole size={16} aria-hidden="true" />
            )}

            <span>
              {isCurrentPlan
                ? 'Paket Saat Ini'
                : BLOCKED_LABELS[purchaseBlockReason] || 'Tidak Tersedia'}
            </span>
          </div>
        )}

        {canCheckout && (
          <p className="mt-2 text-center text-[13px] text-muted-foreground">
            Pembayaran diproses melalui DOKU.
          </p>
        )}

        {purchaseBlockReason === 'upgrade_not_allowed' && (
          <p className="mt-2 text-center text-[13px] text-muted-foreground">
            Subscription ini bukan jalur upgrade dari paket aktifmu.
          </p>
        )}

        {purchaseBlockReason === 'subscription_conflict' && (
          <p className="mt-2 text-center text-[13px] text-amber-800">
            Data subscription memerlukan pemeriksaan sebelum melakukan pembelian.
          </p>
        )}
      </div>
    </article>
  )
}

export default SubscriptionCard