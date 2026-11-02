import { Check, ChevronRight } from 'lucide-react'

import MathText from '../../../components/common/MathText'

function QuestionPanel({
    question,
    currentNumber,
    totalQuestions,
    selectedAnswer,
    onSelectAnswer,
    isSavingAnswer,
}) {
    const categoryPath = Array.isArray(question.categoryPath)
        ? question.categoryPath
        : []

    return (
        <section
            aria-labelledby="cat-question-title"
            className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-7 lg:p-9"
        >
            <div className="flex items-center gap-3.5 border-b border-border pb-5">
                <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-[14px] font-bold text-white"
                >
                    {currentNumber}
                </span>

                <div className="min-w-0">
                    <h2
                        id="cat-question-title"
                        className="text-[17px] font-bold text-foreground"
                    >
                        Soal Nomor {currentNumber}
                    </h2>

                    <p className="text-[13px] text-muted-foreground">
                        {currentNumber} dari {totalQuestions} soal
                    </p>
                </div>
            </div>

            {categoryPath.length > 0 && (
                <nav aria-label="Kategori soal" className="mt-5">
                    <ol className="flex flex-wrap items-center gap-1.5">
                        {categoryPath.map((category, index) => (
                            <li
                                key={`${index}-${category}`}
                                className="flex items-center gap-1.5"
                            >
                                {index > 0 && (
                                    <ChevronRight
                                        size={15}
                                        aria-hidden="true"
                                        className="text-muted-foreground"
                                    />
                                )}

                                <span
                                    className={
                                        index === 0
                                            ? 'rounded-lg bg-primary-50 px-3 py-1 text-[13px] font-semibold text-primary-700'
                                            : 'text-[13px] font-medium text-muted-foreground'
                                    }
                                >
                                    {category}
                                </span>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            <div className="pt-6">
                {question.questionImage && (
                    <img
                        src={question.questionImage}
                        alt="Gambar pendukung soal"
                        className="mb-6 max-h-96 max-w-full rounded-xl object-contain"
                    />
                )}

                <MathText
                    content={question.questionText}
                    className="text-[14px] font-medium leading-8 text-foreground lg:text-[16px] lg:leading-9"
                />

                <div
                    role="group"
                    aria-label="Pilihan jawaban"
                    className="mt-7 space-y-3"
                >
                    {question.answerOptions?.map((option) => {
                        const isSelected = selectedAnswer === option.key

                        return (
                            <button
                                key={option.key}
                                type="button"
                                disabled={isSavingAnswer}
                                onClick={() => onSelectAnswer(option.key)}
                                aria-pressed={isSelected}
                                className={`focus-ring flex w-full min-w-0 items-start gap-4 rounded-xl border p-4 text-left transition-colors disabled:cursor-wait disabled:opacity-70 lg:p-5 ${
                                    isSelected
                                        ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                                        : 'border-border bg-card hover:border-primary/60 hover:bg-muted/60'
                                }`}
                            >
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold ${
                                        isSelected
                                            ? 'bg-primary-700 text-white'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {option.key}
                                </span>

                                <div className="min-w-0 flex-1 pt-1.5">
                                    <MathText
                                        content={option.text}
                                        className="text-[14px] leading-relaxed text-foreground lg:text-[15px]"
                                    />
                                </div>

                                {isSelected && (
                                    <Check
                                        size={20}
                                        aria-hidden="true"
                                        className="mt-2 shrink-0 text-primary-700"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default QuestionPanel