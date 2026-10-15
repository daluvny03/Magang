import { CheckCircle2, XCircle } from 'lucide-react'
import { getImageUrl } from '../../../utils/image-url'
import QuestionTimeInsight from './QuestionTimeInsight'

const formatNumber = (value) => {
    if (value == null) return '—'

    const number = Number(value)
    if (!Number.isFinite(number)) return '—'

    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 2,
    }).format(number)
}

const isSelectedOption = (question, option) =>
    String(question.selectedAnswer ?? '').toUpperCase() ===
    String(option.key).toUpperCase()

const isCorrectOption = (question, option) =>
    question.categorySlug !== 'tkp' &&
    String(question.correctAnswer ?? '').toUpperCase() ===
    String(option.key).toUpperCase()

function QuestionStatus({ question }) {
    if (question.selectedAnswer == null) {
        return (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Tidak Dijawab
            </span>
        )
    }

    if (question.categorySlug === 'tkp') {
        return (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                Skor {formatNumber(question.earnedScore)}
            </span>
        )
    }

    return question.isCorrect === true ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 size={14} />
            Benar
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            <XCircle size={14} />
            Salah
        </span>
    )
}

function QuestionOption({ question, option }) {
    const selected = isSelectedOption(question, option)
    const correct = isCorrectOption(question, option)
    const isTKP = question.categorySlug === 'tkp'

    const className = [
        'rounded-xl border p-3 sm:p-4',
        correct
            ? 'border-green-300 bg-green-50'
            : selected
                ? 'border-blue-300 bg-blue-50'
                : 'border-slate-200 bg-white',
    ].join(' ')

    return (
        <div className={className}>
            <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-slate-700">
                    {option.key}
                </span>

                <div className="min-w-0 flex-1 space-y-2">
                    {option.text && (
                        <p className="whitespace-pre-wrap break-words text-sm text-slate-800">
                            {option.text}
                        </p>
                    )}

                    {option.image && (
                        <img
                            src={getImageUrl(option.image)}
                            alt={`Gambar opsi ${option.key}`}
                            loading="lazy"
                            className="max-h-64 max-w-full rounded-lg object-contain"
                        />
                    )}

                    <div className="flex flex-wrap gap-2">
                        {selected && (
                            <span className="text-xs font-semibold text-blue-700">
                                Jawaban Anda
                            </span>
                        )}

                        {correct && (
                            <span className="text-xs font-semibold text-green-700">
                                Jawaban Benar
                            </span>
                        )}

                        {isTKP && (
                            <span className="text-xs font-medium text-slate-600">
                                Skor: {formatNumber(option.score)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Explanation({ explanation }) {
    if (!explanation) {
        return (
            <p className="text-sm text-slate-500">
                Pembahasan belum tersedia.
            </p>
        )
    }

    const data =
        typeof explanation === 'string'
            ? { summary: explanation }
            : explanation

    const fields = [
        { key: 'summary', label: 'Ringkasan' },
        { key: 'detail', label: 'Penjelasan Detail' },
        { key: 'tips', label: 'Tips' },
    ]

    const availableFields = fields.filter(
        ({ key }) =>
            typeof data[key] === 'string' &&
            data[key].trim().length > 0
    )

    if (availableFields.length === 0) {
        return (
            <p className="text-sm text-slate-500">
                Pembahasan belum tersedia.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {availableFields.map(({ key, label }) => (
                <div key={key}>
                    <h4 className="mb-1 text-sm font-semibold text-slate-800">
                        {label}
                    </h4>

                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">
                        {data[key]}
                    </p>
                </div>
            ))}
        </div>
    )
}

function QuestionAnalysisCard({ question }) {
    const options = Array.isArray(question.answerOptions)
        ? question.answerOptions
        : []

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                        Soal {question.questionOrder}
                    </span>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase text-slate-600">
                        {question.categorySlug}
                    </span>
                </div>

                <QuestionStatus question={question} />
            </div>

            <div className="mb-5 space-y-3">
                {question.questionText && (
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">
                        {question.questionText}
                    </p>
                )}

                {question.questionImage && (
                    <img
                        src={getImageUrl(question.questionImage)}
                        alt={`Gambar soal ${question.questionOrder}`}
                        loading="lazy"
                        className="max-h-80 max-w-full rounded-xl object-contain"
                    />
                )}
            </div>

            <div className="space-y-3">
                {options.map((option) => (
                    <QuestionOption
                        key={option.key}
                        question={question}
                        option={option}
                    />
                ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-sm font-medium text-slate-700">
                    Skor diperoleh: {formatNumber(question.earnedScore)}
                    {' / '}
                    {formatNumber(question.maximumScore)}
                </p>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                    Ringkasan Jawaban
                </h3>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">
                            Jawaban Anda
                        </span>

                        <span className="font-semibold text-slate-900">
                            {question.selectedAnswer ?? 'Tidak dijawab'}
                        </span>
                    </div>

                    {question.categorySlug !== 'tkp' && (
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-500">
                                Jawaban Benar
                            </span>

                            <span className="font-semibold text-green-700">
                                {question.correctAnswer ?? '—'}
                            </span>
                        </div>
                    )}

                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">
                            Skor Diperoleh
                        </span>

                        <span className="font-semibold text-slate-900">
                            {formatNumber(question.earnedScore)}
                            {' / '}
                            {formatNumber(question.maximumScore)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                    Pembahasan Soal
                </h3>

                <Explanation explanation={question.explanation} />
            </div>
            <QuestionTimeInsight question={question} />
        </article>
    )
}

export default QuestionAnalysisCard
