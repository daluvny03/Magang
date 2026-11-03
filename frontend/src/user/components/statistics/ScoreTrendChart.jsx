import { useId } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getPassingStatus } from '@/user/constants/passingStatus'
import { formatNumber } from '@/utils/format'
import { prefersReducedMotion } from '@/utils/motion'

const COLORS = {
  line: '#337379',
  fill: '#51a8b1',
  grid: '#e3e8ee',
  axis: '#5b6776',
  surface: '#ffffff',
}

function TrendTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload
  const status = getPassingStatus(point.passingStatus)

  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-[13px] text-foreground shadow-soft">
      <p className="font-bold">{point.tryoutName}</p>
      <p className="text-muted-foreground">{point.dateLabel}</p>

      <p className="mt-1">
        Skor: {formatNumber(point.score)}% ({formatNumber(point.totalScore)} /{' '}
        {formatNumber(point.maximumScore)})
      </p>

      <p>{status.shortLabel}</p>
    </div>
  )
}

function ScoreTrendChart({ points, height = 260 }) {
  const gradientId = `trend-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const labelOf = Object.fromEntries(
    points.map((point) => [point.attemptId, point.label])
  )

  return (
    <>
      <div
        role="img"
        aria-label={`Grafik perkembangan skor dari ${points.length} tryout terakhir. Rincian tersedia pada tabel tersembunyi di bawahnya.`}
        style={{ width: '100%', height }}
      >
        <ResponsiveContainer>
          <AreaChart data={points} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.fill} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS.fill} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 6" vertical={false} stroke={COLORS.grid} />

            <XAxis
              dataKey="attemptId"
              tickFormatter={(id) => labelOf[id] ?? ''}
              interval="preserveStartEnd"
              minTickGap={24}
              tickLine={false}
              axisLine={false}
              tick={{ fill: COLORS.axis, fontSize: 12 }}
              dy={6}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: COLORS.axis, fontSize: 12 }}
            />

            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: COLORS.line, strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke={COLORS.line}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={{ r: 3.5, fill: COLORS.surface, stroke: COLORS.line, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: COLORS.line, stroke: COLORS.surface, strokeWidth: 3 }}
              isAnimationActive={!prefersReducedMotion()}
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <table className="sr-only">
        <caption>Perkembangan skor tryout</caption>

        <thead>
          <tr>
            <th scope="col">Tryout</th>
            <th scope="col">Tanggal</th>
            <th scope="col">Skor</th>
            <th scope="col">Status</th>
          </tr>
        </thead>

        <tbody>
          {points.map((point) => (
            <tr key={point.attemptId}>
              <th scope="row">{point.tryoutName}</th>
              <td>{point.dateLabel}</td>
              <td>{formatNumber(point.score)}%</td>
              <td>{getPassingStatus(point.passingStatus).shortLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default ScoreTrendChart