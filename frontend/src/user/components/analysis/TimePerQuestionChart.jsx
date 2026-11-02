import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Timer } from 'lucide-react'

import Surface from '@/user/components/common/Surface'
import { TIME_STATUS } from '@/user/constants/timeStatus'
import { formatDurationShort, formatRatio } from '@/utils/format'

const LEGEND_KEYS = [
  'relatively_fast',
  'normal',
  'relatively_slow',
  'insufficient_data',
]

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const point = payload[0].payload
  const config = TIME_STATUS[point.statusKey]

  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-[13px] text-foreground shadow-soft">
      <p className="font-bold">Soal nomor {point.number}</p>
      <p className="mt-1">Waktu: {formatDurationShort(point.rawSeconds)}</p>
      <p>Kategori: {String(point.categorySlug ?? '').toUpperCase()}</p>
      <p>Status: {config.label}</p>
      {point.ratio != null && <p>Rasio: {formatRatio(point.ratio)}</p>}
    </div>
  )
}

function TimePerQuestionChart({ rows, averageSeconds }) {
  const data = [...rows]
    .sort((a, b) => a.number - b.number)
    .map((row) => ({
      number: row.number,
      seconds: row.seconds ?? 0,
      rawSeconds: row.seconds,
      categorySlug: row.categorySlug,
      statusKey: row.statusKey,
      ratio: row.ratio,
    }))

  const tickInterval = Math.max(0, Math.ceil(data.length / 12) - 1)

  return (
    <Surface className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Timer size={20} aria-hidden="true" className="text-primary-700" />

        <h2 className="text-[17px] font-bold text-foreground">
          Grafik Waktu per Soal
        </h2>
      </div>

      <p className="mt-1 text-[14px] leading-6 text-muted-foreground">
        Tinggi batang adalah lama pengerjaan tiap soal. Warna menunjukkan
        statusnya, dan garis putus-putus adalah rata-rata per soal.
      </p>

      <div
        role="img"
        aria-label="Grafik batang waktu pengerjaan setiap soal. Rincian lengkap tersedia pada tabel di bawah."
        className="mt-4 h-[320px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="#e3e8ee" vertical={false} />

            <XAxis
              dataKey="number"
              interval={tickInterval}
              tick={{ fontSize: 12, fill: '#5b6776' }}
              tickLine={false}
              axisLine={{ stroke: '#e3e8ee' }}
            />

            <YAxis
              tick={{ fontSize: 12, fill: '#5b6776' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} dtk`}
              width={56}
            />

            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(81,168,177,0.08)' }} />

            {averageSeconds != null && (
              <ReferenceLine
                y={averageSeconds}
                stroke="#f08a2c"
                strokeDasharray="6 5"
                strokeWidth={1.5}
              />
            )}

            <Bar dataKey="seconds" radius={[5, 5, 0, 0]} animationDuration={600}>
              {data.map((entry) => (
                <Cell
                  key={entry.number}
                  fill={TIME_STATUS[entry.statusKey].chartColor}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
        {LEGEND_KEYS.map((key) => (
          <li key={key} className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-sm"
              style={{ background: TIME_STATUS[key].chartColor }}
            />
            {TIME_STATUS[key].label}
          </li>
        ))}

        {averageSeconds != null && (
          <li className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-0 w-5 border-t-2 border-dashed border-accent"
            />
            Rata-rata per soal
          </li>
        )}
      </ul>
    </Surface>
  )
}

export default TimePerQuestionChart