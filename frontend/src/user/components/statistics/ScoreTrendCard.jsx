import { Link } from 'react-router-dom'

import { buttonClass } from '@/user/components/common/buttonStyles'
import Surface from '@/user/components/common/Surface'

import ScoreTrendChart from './ScoreTrendChart'

function ScoreTrendCard({
  points,
  title = 'Perkembangan Skor',
  subtitle,
  height = 260,
  showLink = true,
}) {
  const defaultSubtitle =
    points.length > 0
      ? `${points.length} pengerjaan terakhir dalam persen (skala 0–100%)`
      : 'Skor tiap tryout yang kamu selesaikan akan tampil di sini'

  return (
    <Surface
      as="section"
      aria-labelledby="score-trend-title"
      className="p-5 sm:p-6 lg:col-span-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="score-trend-title" className="text-[17px] font-bold text-foreground">
            {title}
          </h2>

          <p className="mt-1 text-[14px] leading-6 text-muted-foreground">
            {subtitle ?? defaultSubtitle}
          </p>
        </div>

        {showLink && (
          <Link to="/user/statistics" className={buttonClass.outline}>
            Analisis lengkap
          </Link>
        )}
      </div>

      <div className="mt-4">
        {points.length > 0 ? (
          <>
            <ScoreTrendChart points={points} height={height} />

            {points.length === 1 && (
              <p className="mt-3 rounded-xl bg-muted/60 px-4 py-3 text-[14px] leading-6 text-muted-foreground">
                Selesaikan satu tryout lagi untuk melihat perkembangan skormu.
              </p>
            )}

          </>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <p className="text-[15px] font-semibold text-foreground">
              Belum ada data perkembangan
            </p>

            <p className="mt-1 max-w-sm text-[14px] leading-6 text-muted-foreground">
              Kerjakan tryout pertamamu untuk mulai melihat grafik perkembangan
              skor.
            </p>

            <Link to="/user/tryouts" className={`${buttonClass.solid} mt-4`}>
              Mulai Tryout
            </Link>
          </div>
        )}
      </div>
    </Surface>
  )
}

export default ScoreTrendCard
