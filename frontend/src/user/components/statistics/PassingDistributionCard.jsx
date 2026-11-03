import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import Surface from '@/user/components/common/Surface'
import { PASSING_STATUS } from '@/user/constants/passingStatus'
import { getPassingDistribution } from '@/user/utils/statistics'
import { formatNumber } from '@/utils/format'
import { prefersReducedMotion } from '@/utils/motion'

function PassingDistributionCard({ summary }) {
  const { total, items } = getPassingDistribution(summary)

  const chartData = items
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      name: PASSING_STATUS[item.key].shortLabel,
      color: PASSING_STATUS[item.key].chartColor,
    }))

  return (
    <Surface
      as="section"
      aria-labelledby="passing-distribution-title"
      className="p-5 sm:p-6"
    >
      <h2
        id="passing-distribution-title"
        className="text-[17px] font-bold text-foreground"
      >
        Ringkasan Passing Grade
      </h2>

      <p className="mt-1 text-[14px] leading-6 text-muted-foreground">
        Hasil seluruh tryout yang sudah kamu selesaikan.
      </p>

      <div
        aria-hidden="true"
        className="relative mx-auto mt-4 h-[200px] w-[200px]"
      >
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              formatter={(value, name) => [`${value} tryout`, name]}
              contentStyle={{ borderRadius: 12, border: '1px solid #e3e8ee', fontSize: 13 }}
            />

            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={3}
              stroke="none"
              isAnimationActive={!prefersReducedMotion()}
              animationDuration={600}
            >
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] font-bold leading-none text-foreground">
            {formatNumber(total)}
          </span>

          <span className="mt-1 text-[13px] text-muted-foreground">tryout</span>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {items.map((item) => {
          const config = PASSING_STATUS[item.key]
          const Icon = config.Icon

          return (
            <li key={item.key} className="flex items-center gap-3 text-[14px]">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: config.chartColor }}
              />

              <Icon size={16} aria-hidden="true" className="shrink-0 text-muted-foreground" />

              <span className="min-w-0 flex-1 text-foreground">{config.label}</span>

              <span className="font-bold text-foreground">{formatNumber(item.count)}</span>

              <span className="w-12 text-right text-[13px] text-muted-foreground">
                {item.percent}%
              </span>
            </li>
          )
        })}
      </ul>
    </Surface>
  )
}

export default PassingDistributionCard