import TryoutPassingRules from './TryoutPassingRules'
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Lock,
} from 'lucide-react'
import { hasActiveTryoutAttempt, getTryoutScheduleStatus } from '../../utils/tryout-availability'

function TryoutCard({ tryout, onDetail, onSubscribe, onResume }) {
  const canResume = hasActiveTryoutAttempt(tryout)
  const scheduleLabel = {
    upcoming: 'Belum dimulai',
    active: 'Periode aktif',
    ended: 'Periode mulai berakhir',
  }[getTryoutScheduleStatus(tryout)] || 'Jadwal belum tersedia'

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-primary-200 hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <BookOpen size={21} />
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${tryout.isFree
              ? 'bg-green-50 text-green-700'
              : 'bg-primary-50 text-primary-700'
            }`}
        >
          {tryout.isFree
            ? 'Gratis'
            : tryout.isAccessible
              ? 'Premium'
              : 'Tingkatkan Subscription'}
        </span>
      </div>

      {/* Content */}
      <div className="mt-5 flex-1">
        <h2 className="text-base font-semibold text-gray-900">
          {tryout.name}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
          {tryout.description ||
            'Latihan simulasi untuk membantu persiapan seleksi CPNS.'}
        </p>
      </div>

      {/* Information */}
      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-600">
          {scheduleLabel}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock3 size={16} />
            {tryout.durationMinutes} menit
          </span>

          <span className="flex items-center gap-1.5">
            <BookOpen size={16} />
            {tryout.questionCount} soal
          </span>
        </div>

        <div className="flex items-start gap-1.5 text-sm text-gray-500">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Passing minimal</p>
            <TryoutPassingRules tryout={tryout} />
          </div>
        </div>
      </div>

      {/* Action */}
      {canResume ? (
        <button
          type="button"
          onClick={() => onResume(tryout)}
          className="mt-5 w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Lanjutkan Tryout
        </button>
      ) : tryout.isAccessible ? (
        <button
          type="button"
          onClick={() => onDetail(tryout)}
          className="mt-5 flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Lihat Detail
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onSubscribe(tryout)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
        >
          <Lock size={16} />
          Buka Akses Tryout
        </button>
      )}

    </article>
  )
}

export default TryoutCard
