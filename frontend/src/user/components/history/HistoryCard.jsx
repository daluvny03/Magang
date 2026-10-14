
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
} from 'lucide-react'

const PASSING_STATUS = {
  passed: {
    label: 'Lulus',
    className:
      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  failed: {
    label: 'Tidak Lulus',
    className:
      'bg-red-50 text-red-700 ring-red-200',
  },
  not_evaluated: {
    label: 'Belum Dievaluasi',
    className:
      'bg-slate-100 text-slate-600 ring-slate-200',
  },
}

const formatScore = (value) => {
  if (value === null || value === undefined) {
    return '—'
  }

  const number = Number(value)

  if (!Number.isFinite(number)) {
    return '—'
  }

  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(number)
}

const formatCompletedAt = (value) => {
  if (!value) return 'Tanggal tidak tersedia'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Tanggal tidak tersedia'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(date) + ' WIB'
}

function HistoryCard({ history }) {
  const status =
    PASSING_STATUS[history.passingStatus] ??
    PASSING_STATUS.not_evaluated

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-slate-500">
            <ClipboardList
              size={18}
              aria-hidden="true"
            />
            <span className="text-xs font-medium uppercase tracking-wide">
              Riwayat Tryout
            </span>
          </div>

          <h3 className="break-words text-lg font-semibold text-slate-900">
            {history.tryoutName}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays
              size={16}
              aria-hidden="true"
            />
            <span>
              {formatCompletedAt(
                history.completedAt
              )}
            </span>
          </div>
        </div>

        <span
          className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="my-5 border-t border-slate-100" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-slate-500">
            Total Skor
          </p>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {formatScore(history.totalScore)}
            </span>

            <span className="text-lg text-slate-400">
              / {formatScore(history.maximumScore)}
            </span>
          </div>
        </div>

        <Link
          to={`/user/results/${history.attemptId}`}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Lihat Hasil
          <ArrowRight
            size={16}
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  )
}

export default HistoryCard
