
import { Award, CreditCard, TrendingUp } from 'lucide-react'

const number = new Intl.NumberFormat('id-ID')

const PACKAGE_COLORS = [
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-pink-500',
]

const PopularSubscriptionTiers = ({ data }) => {
  const tiers = data?.tiers ?? []
  const monthly = data?.monthly ?? []
  const totalTransactions = data?.summary?.totalTransactions ?? 0

  const tierSales = tiers
    .map((tier) => {
      const transactionCount = monthly.reduce(
        (total, month) => {
          return total + (month.tierCounts?.[tier.id] ?? 0)
        },
        0
      )

      return {
        ...tier,
        transactionCount,
        percentage: totalTransactions
          ? (transactionCount / totalTransactions) * 100
          : 0,
      }
    })
    .filter((tier) => tier.transactionCount > 0)
    .sort((a, b) => {
      if (b.transactionCount !== a.transactionCount) {
        return b.transactionCount - a.transactionCount
      }

      return a.name.localeCompare(b.name)
    })
    .slice(0, 5)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">
            Subscription Terpopuler
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Paket dengan transaksi berhasil terbanyak selama enam bulan terakhir.
          </p>
        </div>

        <span className="rounded-xl bg-amber-50 p-2.5">
          <Award size={20} className="text-amber-600" />
        </span>
      </div>

      {tierSales.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center text-center">
          <CreditCard size={32} className="text-gray-300" />

          <p className="mt-3 text-sm font-medium text-gray-700">
            Belum ada data penjualan
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Paket populer akan muncul setelah terdapat transaksi berhasil.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {tierSales.map((tier, index) => (
            <div key={tier.id}>
              <div className="mb-2 flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${PACKAGE_COLORS[index]}`}
                >
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold text-gray-800">
                    {tier.name}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {number.format(tier.transactionCount)} transaksi
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-gray-900">
                    {tier.percentage.toFixed(1)}%
                  </p>

                  {index === 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                      <TrendingUp size={11} />
                      Terpopuler
                    </span>
                  )}
                </div>
              </div>

              <div className="ml-12 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${PACKAGE_COLORS[index]}`}
                  style={{
                    width: `${tier.percentage}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default PopularSubscriptionTiers
