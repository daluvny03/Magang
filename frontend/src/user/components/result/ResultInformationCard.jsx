
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileQuestion,
    Trophy,
    XCircle,
} from 'lucide-react'

const PASSING_STATUS = {
    passed: {
        label: 'Memenuhi Passing Grade',
        description:
            'Nilai kamu telah memenuhi ketentuan kelulusan tryout.',
        className:
            'bg-green-100 text-green-700',
        icon: CheckCircle2,
    },
    failed: {
        label: 'Belum Memenuhi Passing Grade',
        description:
            'Nilai kamu belum memenuhi ketentuan kelulusan tryout.',
        className:
            'bg-red-100 text-red-700',
        icon: XCircle,
    },
    not_evaluated: {
        label: 'Passing Grade Tidak Diterapkan',
        description:
            'Paket tryout ini tidak menggunakan ketentuan passing grade.',
        className:
            'bg-gray-100 text-gray-600',
        icon: FileQuestion,
    },
}

const formatDate = (value) => {
    if (!value) return '-'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return '-'
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
    }).format(date)
}

const formatDuration = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0))
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const remainingSeconds = total % 60

    return [
        hours > 0 ? `${hours} jam` : null,
        minutes > 0 ? `${minutes} menit` : null,
        remainingSeconds > 0 || total === 0
            ? `${remainingSeconds} detik`
            : null,
    ].filter(Boolean).join(' ')
}

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-sm text-gray-500">
                    {label}
                </span>
            </div>

            <p className="mt-3 text-2xl font-bold text-gray-900">
                {value}
            </p>
        </div>
    )
}

function PassingGradeStatus({ status }) {
    const config =
        PASSING_STATUS[status] ??
        PASSING_STATUS.not_evaluated

    const Icon = config.icon

    return (
        <div className="mt-4 flex flex-col items-center gap-2">
            <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${config.className}`}
            >
                <Icon className="h-4 w-4" />

                {config.label}
            </span>

            <p className="max-w-md text-center text-xs text-gray-500">
                {config.description}
            </p>
        </div>
    )
}

function ResultInformationCard({ attempt, summary }) {
    return (
        <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Informasi Ujian
                        </h2>

                        <p className="mt-2 font-medium text-gray-700">
                            {attempt.tryoutName}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Percobaan ke-{attempt.attemptNumber}
                        </p>
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Selesai
                    </span>
                </div>

                <div className="mt-6 rounded-xl bg-blue-50 px-5 py-6 text-center">
                    <Trophy className="mx-auto h-7 w-7 text-blue-600" />

                    <p className="mt-2 text-sm font-medium text-gray-600">
                        Total Nilai
                    </p>

                    <p className="mt-1 text-4xl font-bold text-blue-700">
                        {summary.totalScore}
                    </p>
                </div>
                
                {summary.passingScore != null && (
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Passing minimal total: <strong>{summary.passingScore}</strong>
                    </p>
                )}
                {summary.passingMode === 'category' && (
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Kelulusan mensyaratkan semua kategori memenuhi passing minimal di bawah.
                    </p>
                )}
                <PassingGradeStatus
                    status={summary.passingStatus}
                />

                <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard
                        icon={CheckCircle2}
                        label="Benar"
                        value={summary.correctAnswers}
                        color="text-green-600"
                    />

                    <StatCard
                        icon={XCircle}
                        label="Salah"
                        value={summary.wrongAnswers}
                        color="text-red-600"
                    />

                    <StatCard
                        icon={FileQuestion}
                        label="Belum Dijawab"
                        value={summary.unanswered}
                        color="text-amber-600"
                    />

                    <StatCard
                        icon={CheckCircle2}
                        label="Terjawab"
                        value={`${summary.answered}/${summary.totalQuestions}`}
                        color="text-blue-600"
                    />
                </div>

                <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CalendarDays className="h-4 w-4" />
                            Waktu Mulai
                        </div>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                            {formatDate(attempt.startedAt)}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CalendarDays className="h-4 w-4" />
                            Waktu Selesai
                        </div>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                            {formatDate(attempt.completedAt)}
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock3 className="h-4 w-4" />
                            Durasi Pengerjaan
                        </div>

                        <p className="mt-2 text-sm font-semibold text-gray-800">
                            {formatDuration(attempt.durationSeconds)}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ResultInformationCard
