
import {
  ArrowLeft,
  ChartNoAxesColumn,
  Clock3,
  Medal,
  Trophy,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const upcomingFeatures = [
  {
    icon: Medal,
    title: 'Peringkat Peserta',
    description:
      'Lihat posisi dan pencapaian peserta berdasarkan hasil simulasi tryout.',
  },
  {
    icon: ChartNoAxesColumn,
    title: 'Perbandingan Skor',
    description:
      'Bandingkan performa tryout dengan peserta lainnya.',
  },
  {
    icon: Users,
    title: 'Kompetisi Peserta',
    description:
      'Ikuti perkembangan persaingan dalam simulasi CAT CPNS.',
  },
]

function LeaderboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        to="/user/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary-600"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Kembali ke Beranda
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary-50 via-white to-indigo-50 px-6 py-12 text-center sm:px-10 sm:py-16">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-100 text-primary-600">
            <Trophy size={38} aria-hidden="true" />
          </div>

          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <Clock3 size={14} aria-hidden="true" />
              Coming Soon
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Leaderboard
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Fitur Leaderboard sedang dalam pengembangan.
            Nantinya, kamu dapat melihat peringkat peserta,
            membandingkan skor, dan mengetahui pencapaian
            dalam simulasi CAT CPNS.
          </p>
        </div>

        {/* Features */}
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">
              Fitur yang Akan Hadir
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Beberapa fitur yang direncanakan untuk
              pengembangan Leaderboard.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {upcomingFeatures.map((feature) => {
              const Icon = feature.icon

              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <Icon size={24} aria-hidden="true" />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </article>
              )
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/user/tryouts"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <Trophy size={18} aria-hidden="true" />
              Jelajahi Tryout
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LeaderboardPage
