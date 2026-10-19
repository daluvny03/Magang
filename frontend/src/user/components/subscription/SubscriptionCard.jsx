
import { Crown, Check } from 'lucide-react'

const formatPrice = (price) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(price)

function SubscriptionCard({
    tier,
    isCurrentPlan = false,
    hasActivePremium = false,
    onCheckout,
    isCheckoutLoading = false,
}) {
    const isPremium = tier.slug === 'premium'

    const durationLabel =
        tier.duration?.unit === 'year'
            ? `${tier.duration.value} tahun`
            : null

    return (
        <div
            className={`rounded-2xl border p-6 ${isPremium
                ? 'border-blue-500 bg-blue-50/50'
                : 'border-gray-200 bg-white'
                }`}
        >
            <div className="mb-4 flex items-center gap-2">
                {isPremium && (
                    <Crown className="h-5 w-5 text-blue-600" />
                )}
                <h3 className="text-xl font-semibold">
                    {tier.name}
                </h3>
            </div>

            <p className="text-3xl font-bold">
                {formatPrice(tier.price)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
                {durationLabel
                    ? `Berlaku ${durationLabel}`
                    : 'Gratis'}
            </p>

            {tier.description && (
                <p className="mt-4 text-sm text-gray-600">
                    {tier.description}
                </p>
            )}

            <div className="mt-6 flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>
                    {isPremium
                        ? 'Akses paket tryout Premium'
                        : 'Akses paket tryout gratis'}
                </span>
            </div>


            <div className="mt-8">
                {isPremium ? (
                    <button
                        type="button"
                        onClick={onCheckout}
                        disabled={isCheckoutLoading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isCheckoutLoading
                            ? 'Menyiapkan transaksi...'
                            : hasActivePremium
                                ? 'Perpanjang Premium'
                                : 'Beli Premium'}
                    </button>
                ) : (
                    <div className="rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-600">
                        {isCurrentPlan ? 'Paket Saat Ini' : 'Paket Gratis'}
                    </div>
                )}

                {isPremium && (
                    <p className="mt-2 text-center text-xs text-gray-500">
                        Pembayaran diproses melalui DOKU.
                    </p>
                )}
            </div>

        </div>
    )
}

export default SubscriptionCard
