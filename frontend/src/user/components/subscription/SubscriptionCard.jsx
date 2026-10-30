
import { Check, Crown, LockKeyhole } from 'lucide-react'

const formatPrice = (price) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(price) || 0)

const formatDuration = (duration) => {
  if (!duration) return null

  const labels = {
    day: 'hari',
    month: 'bulan',
    year: 'tahun',
  }

  const unit = labels[duration.unit]

  if (!unit) return null

  return `${duration.value} ${unit}`
}

const actionLabels = {
  new: 'Beli Subscription',
  renewal: 'Perpanjang Subscription',
  upgrade: 'Upgrade Subscription',
}

const blockedLabels = {
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

  const durationLabel = formatDuration(tier.duration)

  const buttonLabel =
    isCheckoutLoading
      ? 'Menyiapkan transaksi...'
      : actionLabels[purchaseAction] || 'Beli Subscription'

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border p-6 ${
        isFeatured
          ? 'border-blue-500 bg-blue-50/50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        {isFeatured && (
          <Crown className="h-5 w-5 text-blue-600" />
        )}

        <h3 className="text-xl font-semibold text-gray-900">
          {tier.name}
        </h3>
      </div>

      <p className="text-3xl font-bold text-gray-900">
        {formatPrice(tier.price)}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        {isFree
          ? 'Akses gratis'
          : durationLabel
            ? `Berlaku ${durationLabel}`
            : 'Durasi tidak tersedia'}
      </p>

      {tier.description && (
        <p className="mt-4 text-sm text-gray-600">
          {tier.description}
        </p>
      )}

      <div className="mt-6 flex items-start gap-2 text-sm text-gray-600">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />

        <span>
          {isFree
            ? 'Akses fitur dasar dan tryout gratis'
            : 'Akses tryout sesuai subscription dan inheritance yang ditetapkan'}
        </span>
      </div>

      <div className="mt-auto pt-8">
        {canCheckout ? (
          <button
            type="button"
            onClick={onCheckout}
            disabled={isCheckoutLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonLabel}
          </button>
        ) : (
          <div className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-600">
            {!isCurrentPlan && !isFree && (
              <LockKeyhole size={16} />
            )}

            <span>
              {isCurrentPlan
                ? 'Paket Saat Ini'
                : blockedLabels[purchaseBlockReason] ||
                  'Tidak Tersedia'}
            </span>
          </div>
        )}

        {canCheckout && (
          <p className="mt-2 text-center text-xs text-gray-500">
            Pembayaran diproses melalui DOKU.
          </p>
        )}

        {purchaseBlockReason === 'upgrade_not_allowed' && (
          <p className="mt-2 text-center text-xs text-gray-500">
            Subscription ini bukan jalur upgrade dari
            paket aktifmu.
          </p>
        )}

        {purchaseBlockReason === 'subscription_conflict' && (
          <p className="mt-2 text-center text-xs text-amber-700">
            Data subscription memerlukan pemeriksaan
            sebelum melakukan pembelian.
          </p>
        )}
      </div>
    </article>
  )
}

export default SubscriptionCard
