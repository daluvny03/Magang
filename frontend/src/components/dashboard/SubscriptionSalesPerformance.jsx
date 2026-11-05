import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Minus,
} from 'lucide-react'

const PACKAGE_COLORS = [
  '#6366f1',
  '#06b6d4',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#8b5cf6',
]

const formatNumber = (value) => {
  return new Intl.NumberFormat('id-ID').format(value ?? 0)
}

const formatMonth = (period) => {
  const [year, month] = period.split('-')

  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString('id-ID', {
    month: 'short',
    year: '2-digit',
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  const total = payload.reduce(
    (sum, item) => sum + (item.value ?? 0),
    0
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-slate-800">
        {label}
      </p>

      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-6 text-xs"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>

            <span className="font-semibold text-slate-800">
              {formatNumber(item.value)}
            </span>
          </div>
        ))}

        <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-xs">
          <span className="font-medium text-slate-600">
            Total transaksi
          </span>
          <span className="font-bold text-slate-900">
            {formatNumber(total)}
          </span>
        </div>
      </div>
    </div>
  )
}

const SubscriptionSalesPerformance = ({ data }) => {
  const summary = data?.summary ?? {}
  const tiers = data?.tiers ?? []
  const monthly = data?.monthly ?? []

  const totalTransactions = summary.totalTransactions ?? 0
  const previousTotalTransactions =
    summary.previousTotalTransactions ?? 0

  const growthPercentage = summary.growthPercentage

  const chartData = monthly.map((item) => {
    const tierCounts = item.tierCounts ?? {}

    const row = {
      period: formatMonth(item.period),
      totalTransactions: item.totalTransactions ?? 0,
    }

    tiers.forEach((tier) => {
      row[tier.id] = tierCounts[tier.id] ?? 0
    })

    return row
  })

  const hasTransactions = totalTransactions > 0
  const hasGrowth = growthPercentage !== null &&
    growthPercentage !== undefined

  const isGrowthPositive = growthPercentage > 0
  const isGrowthNegative = growthPercentage < 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Subscription Sales Performance
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Performa transaksi subscription selama enam bulan terakhir.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Transaksi Berhasil
            </p>

            <div className="rounded-lg bg-indigo-50 p-2">
              <CreditCard className="h-4 w-4 text-indigo-600" />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {formatNumber(totalTransactions)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Dibandingkan dengan enam bulan sebelumnya
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Pertumbuhan Transaksi
            </p>

            <div
              className={`rounded-lg p-2 ${
                isGrowthPositive
                  ? 'bg-emerald-50'
                  : isGrowthNegative
                    ? 'bg-rose-50'
                    : 'bg-slate-100'
              }`}
            >
              {isGrowthPositive ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              ) : isGrowthNegative ? (
                <ArrowDownRight className="h-4 w-4 text-rose-600" />
              ) : (
                <Minus className="h-4 w-4 text-slate-500" />
              )}
            </div>
          </div>

          <p
            className={`mt-3 text-2xl font-bold ${
              isGrowthPositive
                ? 'text-emerald-600'
                : isGrowthNegative
                  ? 'text-rose-600'
                  : 'text-slate-900'
            }`}
          >
            {hasGrowth
              ? `${growthPercentage > 0 ? '+' : ''}${growthPercentage}%`
              : 'Belum tersedia'}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {hasGrowth
              ? `${formatNumber(previousTotalTransactions)} transaksi pada periode sebelumnya`
              : 'Belum ada transaksi pada periode pembanding'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Transaksi per Paket
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Distribusi transaksi berhasil berdasarkan paket subscription.
          </p>
        </div>

        {!hasTransactions ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200">
            <div className="text-center">
              <CreditCard className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Belum ada transaksi subscription
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Data penjualan akan ditampilkan setelah transaksi berhasil.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '12px',
                  }}
                />

                {tiers.map((tier, index) => (
                  <Bar
                    key={tier.id}
                    dataKey={tier.id}
                    name={tier.name}
                    stackId="subscription"
                    fill={
                      PACKAGE_COLORS[
                        index % PACKAGE_COLORS.length
                      ]
                    }
                    radius={
                      index === tiers.length - 1
                        ? [4, 4, 0, 0]
                        : [0, 0, 0, 0]
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  )
}

export default SubscriptionSalesPerformance