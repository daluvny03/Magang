
import {
    CheckCircle2,
    CircleHelp,
    XCircle,
} from 'lucide-react'

const CATEGORY_STYLES = {
    twk: {
        label: 'Tes Wawasan Kebangsaan',
        badge: 'bg-blue-50 text-blue-700',
        progress: 'bg-blue-600',
    },
    tiu: {
        label: 'Tes Intelegensia Umum',
        badge: 'bg-purple-50 text-purple-700',
        progress: 'bg-purple-600',
    },
    tkp: {
        label: 'Tes Karakteristik Pribadi',
        badge: 'bg-amber-50 text-amber-700',
        progress: 'bg-amber-500',
    },
}

function CategoryResultCard({ category }) {
    const style = CATEGORY_STYLES[category.slug] ?? {
        label: category.name,
        badge: 'bg-gray-100 text-gray-700',
        progress: 'bg-gray-600',
    }

    const totalQuestions = Number(category.totalQuestions) || 0
    const answered = Number(category.answered) || 0

    const progress = totalQuestions > 0
        ? Math.min(100, Math.max(0, (answered / totalQuestions) * 100))
        : 0

    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <span
                        className={`inline-flex rounded-lg px-3 py-1 text-sm font-bold uppercase ${style.badge}`}
                    >
                        {category.slug}
                    </span>

                    <p className="mt-2 text-xs text-gray-500">
                        {style.label}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                        {category.totalScore}
                    </p>

                    <p className="text-xs text-gray-500">
                        Poin
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                        Soal Terjawab
                    </span>

                    <span className="font-semibold text-gray-900">
                        {answered}/{totalQuestions}
                    </span>
                </div>

                <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progress jawaban ${category.name}`}
                >
                    <div
                        className={`h-full rounded-full transition-all ${style.progress}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                    {Math.round(progress)}% soal telah dijawab
                </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5">
                <div className="text-center">
                    <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                    <p className="mt-2 text-lg font-bold text-gray-900">
                        {category.correctAnswers}
                    </p>
                    <p className="text-xs text-gray-500">
                        Benar
                    </p>
                </div>

                <div className="text-center">
                    <XCircle className="mx-auto h-4 w-4 text-red-600" />
                    <p className="mt-2 text-lg font-bold text-gray-900">
                        {category.wrongAnswers}
                    </p>
                    <p className="text-xs text-gray-500">
                        Salah
                    </p>
                </div>

                <div className="text-center">
                    <CircleHelp className="mx-auto h-4 w-4 text-amber-600" />
                    <p className="mt-2 text-lg font-bold text-gray-900">
                        {category.unanswered}
                    </p>
                    <p className="text-xs text-gray-500">
                        Kosong
                    </p>
                </div>
            </div>
        </article>
    )
}

export default CategoryResultCard
