
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  ChartNoAxesCombined,
  ClipboardList,
  Clock3,
  Crown,
  LockKeyhole,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const subscriptionBenefits = [
  {
    icon: ClipboardList,
    title: 'Akses Tryout Premium',
    description:
      'Kerjakan lebih banyak paket simulasi CAT CPNS dengan variasi soal yang tersedia.',
  },
  {
    icon: BookOpenCheck,
    title: 'Kunci Jawaban & Pembahasan',
    description:
      'Tinjau jawaban yang dipilih, lihat kunci jawaban, dan pahami pembahasan setiap soal.',
  },
  {
    icon: Clock3,
    title: 'Analisis Waktu Per Soal',
    description:
      'Evaluasi durasi pengerjaan untuk mengetahui soal yang paling banyak menghabiskan waktu.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Analisis Performa Mendalam',
    description:
      'Kenali pola pengerjaan dan evaluasi hasil simulasi secara lebih detail.',
  },
]

function ForbiddenPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/user/tryouts"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Kembali ke Daftar Tryout
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-10 text-center sm:px-10 sm:py-14">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600">
            <LockKeyhole size={36} aria-hidden="true" />
          </div>

          <div className="mt-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <Crown size={14} aria-hidden="true" />
              Fitur Subscription
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Buka Akses Premium
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Tingkatkan pengalaman simulasi CAT CPNS dengan
            berlangganan dan nikmati fitur eksklusif untuk
            mengevaluasi hasil tryout secara lebih mendalam.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900">
              Keuntungan Berlangganan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Dapatkan akses ke berbagai fitur untuk
              memaksimalkan pengalaman simulasi CAT CPNS.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {subscriptionBenefits.map((benefit) => {
              const Icon = benefit.icon

              return (
                <article
                  key={benefit.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Icon size={22} aria-hidden="true" />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {benefit.description}
                  </p>
                </article>
              )
            })}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/user/subscription"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:w-auto"
            >
              <Crown size={18} aria-hidden="true" />
              Lihat Paket Subscription
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <p className="text-center text-xs text-slate-400">
              Pilih paket subscription sesuai kebutuhanmu.
              Akses fitur mengikuti ketentuan paket yang dipilih.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForbiddenPage
