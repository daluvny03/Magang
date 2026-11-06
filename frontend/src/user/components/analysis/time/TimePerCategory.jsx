import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'

import Surface from '@/user/components/common/Surface'
import { CATEGORY_ORDER, CATEGORY_STYLES } from '@/user/constants/categoryStyles'
import { formatDuration, formatDurationShort } from '@/utils/format'

const FALLBACK_COLOR = '#9aa5b1'
const DATA_COLORS = {
  twk: '#2563eb',
  tiu: '#7c3aed',
  tkp: '#f97316',
}

function TimePerCategory({ categories = [] }) {
  const sorted = [...categories].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug)
  )

  const totalSeconds = sorted.reduce(
    (sum, item) => sum + (Number(item.recordedTimeSeconds) || 0),
    0
  )

  const data = sorted.map((item) => {
    const seconds = Number(item.recordedTimeSeconds) || 0
    const style = CATEGORY_STYLES[item.slug]

    return {
      slug: item.slug,
      name: String(item.slug ?? '').toUpperCase(),
      fullName: style?.label ?? item.name ?? '',
      seconds,
      average: item.hasSufficientData ? Number(item.averageTimeSeconds) : null,
      share: totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0,
      color: DATA_COLORS[item.slug] ?? FALLBACK_COLOR,
    }
  })

  return (
    <Surface className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <PieIcon size={20} aria-hidden="true" className="text-primary-700" />

        <h2 className="text-[17px] font-bold text-foreground">
          Waktu per Kategori
        </h2>
      </div>

      <p className="mt-1 text-[14px] leading-6 text-muted-foreground">
        Berapa lama waktu yang kamu habiskan pada setiap kategori soal.
      </p>

      {totalSeconds === 0 ? (
        <p className="mt-5 rounded-xl bg-muted/60 p-4 text-[14px] text-muted-foreground">
          Belum ada waktu pengerjaan yang tercatat.
        </p>
      ) : (
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:items-center">
          <div aria-hidden="true" className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="seconds"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={3}
                  animationDuration={600}
                >
                  {data.map((entry) => (
                    <Cell key={entry.slug} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [formatDuration(value), 'Waktu']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e3e8ee',
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="space-y-4">
            {data.map((entry) => (
              <li key={entry.slug} className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[14px]">
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <span
                      aria-hidden="true"
                      className="h-3 w-3 rounded-full"
                      style={{ background: entry.color }}
                    />
                    {entry.name}
                    <span className="font-normal text-muted-foreground">
                      {entry.fullName}
                    </span>
                  </span>

                  <span className="text-muted-foreground">
                    {formatDurationShort(entry.seconds)} · rata-rata{' '}
                    {entry.average != null ? formatDurationShort(entry.average) : '—'} ·{' '}
                    <strong className="text-foreground">{entry.share}%</strong>
                  </span>
                </div>

                <div
                  aria-hidden="true"
                  className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-700 motion-reduce:transition-none"
                    style={{ width: `${entry.share}%`, background: entry.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Surface>
  )
}

export default TimePerCategory
