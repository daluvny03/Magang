import {
    CalendarDays,
    CheckCircle2,
    CircleHelp,
    ClipboardCheck,
    Clock3,
    FileQuestion,
    RotateCcw,
    Trophy,
    XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDuration } from '@/utils/format'

const PASSING_STATUS = {
    passed: {
        label: 'Memenuhi Passing Grade',
        description:
            'Nilai kamu telah memenuhi ketentuan kelulusan tryout.',
        className: 'bg-emerald-50 text-emerald-800',
        icon: CheckCircle2,
    },
    failed: {
        label: 'Belum Memenuhi Passing Grade',
        description:
            'Nilai kamu belum memenuhi ketentuan kelulusan tryout.',
        className: 'bg-red-50 text-red-800',
        icon: XCircle,
    },
    not_evaluated: {
        label: 'Passing Grade Tidak Diterapkan',
        description:
            'Paket tryout ini tidak menggunakan ketentuan passing grade.',
        className: 'bg-muted text-muted-foreground',
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
function StatTile({ icon: Icon, label, value, iconClass }) {
    return (
        <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={20} aria-hidden="true" />
                </span>

                <dl className="min-w-0">
                    <dt className="text-[13px] text-muted-foreground">
                        {label}
                    </dt>

                    <dd className="text-[22px] font-bold leading-tight text-foreground">
                        {value}
                    </dd>
                </dl>
            </div>
        </div>
    )
}

function PassingGradeStatus({ status }) {
    const config =
        PASSING_STATUS[status] ?? PASSING_STATUS.not_evaluated

    const Icon = config.icon

    return (
        <div>
            <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold ${config.className}`}
            >
                <Icon size={18} aria-hidden="true" />
                {config.label}
            </span>

            <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
                {config.description}
            </p>
        </div>
    )
}

function ResultInformationCard({ attempt, summary }) {
    const stats = [
        {
            icon: CheckCircle2,
            label: 'Benar',
            value: summary.correctAnswers,
            iconClass: 'bg-emerald-50 text-emerald-700',
        },
        {
            icon: XCircle,
            label: 'Salah',
            value: summary.wrongAnswers,
            iconClass: 'bg-red-50 text-destructive',
        },
        {
            icon: CircleHelp,
            label: 'Belum Dijawab',
            value: summary.unanswered,
            iconClass: 'bg-muted text-muted-foreground',
        },
        {
            icon: ClipboardCheck,
            label: 'Terjawab',
            value: `${summary.answered}/${summary.totalQuestions}`,
            iconClass: 'bg-primary-50 text-primary-700',
        },
    ]

    const times = [
        { icon: CalendarDays, label: 'Waktu Mulai', value: formatDate(attempt.startedAt) },
        { icon: CalendarDays, label: 'Waktu Selesai', value: formatDate(attempt.completedAt) },
        { icon: Clock3, label: 'Durasi Pengerjaan', value: formatDuration(attempt.durationSeconds) },
    ]

    return (
        <section
            aria-labelledby="result-info-heading"
            className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7"
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Informasi Ujian
                    </p>

                    <h2
                        id="result-info-heading"
                        className="mt-1 text-[20px] font-bold leading-tight text-foreground"
                    >
                        {attempt.tryoutName}
                    </h2>

                    <p className="mt-1 text-[14px] text-muted-foreground">
                        Percobaan ke-{attempt.attemptNumber}
                    </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[13px] font-semibold text-emerald-800">
                    Selesai
                </span>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-center">
                <div className="rounded-2xl bg-primary-50 px-5 py-8 text-center">
                    <Trophy
                        size={30}
                        aria-hidden="true"
                        className="mx-auto text-primary-700"
                    />

                    <p className="mt-2 text-[14px] font-medium text-muted-foreground">
                        Total Nilai
                    </p>

                    <p className="mt-1 text-[48px] font-bold leading-none text-primary-700">
                        {summary.totalScore}
                    </p>
                </div>

                <div className="space-y-4">
                    <PassingGradeStatus status={summary.passingStatus} />

                    {summary.passingScore != null && (
                        <p className="text-[14px] text-muted-foreground">
                            Passing minimal total:{' '}
                            <strong className="text-foreground">
                                {summary.passingScore}
                            </strong>
                        </p>
                    )}

                    {summary.passingMode === 'category' && (
                        <p className="text-[14px] leading-6 text-muted-foreground">
                            Kelulusan mensyaratkan semua kategori memenuhi
                            passing minimal di bawah.
                        </p>
                    )}

                    {attempt.tryoutId != null && (
                        <Link
                            to={`/user/tryouts/${attempt.tryoutId}`}
                            className="focus-ring inline-flex h-12 items-center gap-2 rounded-xl bg-primary-700 px-5 text-[14px] font-semibold text-white transition hover:bg-primary-700/90"
                        >
                            <RotateCcw size={18} aria-hidden="true" />
                            Kerjakan Ulang
                        </Link>
                    )}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatTile key={stat.label} {...stat} />
                ))}
            </div>

            <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
                {times.map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                        <dt className="flex items-center gap-2 text-[13px] text-muted-foreground">
                            <Icon size={16} aria-hidden="true" />
                            {label}
                        </dt>

                        <dd className="mt-1.5 text-[14px] font-semibold text-foreground">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}

export default ResultInformationCard