const STATUS_CLASS = {
    active: 'border-primary-700 bg-primary-700 text-white shadow-sm',
    doubtful: 'border-amber-300 bg-amber-50 text-amber-800',
    answered: 'border-primary/40 bg-primary-50 text-primary-700',
    empty: 'border-border bg-card text-muted-foreground hover:border-primary hover:bg-primary-50',
}

const LEGEND = [
    { label: 'Sedang dibuka', swatch: 'border-primary-700 bg-primary-700' },
    { label: 'Sudah dijawab', swatch: 'border-primary/40 bg-primary-100' },
    { label: 'Ragu-ragu', swatch: 'border-amber-300 bg-amber-100' },
    { label: 'Belum dijawab', swatch: 'border-border bg-card' },
]

function CatNavigator({
    questions,
    currentQuestionIndex,
    selectedAnswers,
    doubtfulQuestions,
    disabled,
    onQuestionSelect,
}) {
    return (
        <div>
            <div className="no-scrollbar max-h-[38vh] overflow-y-auto pr-1 lg:max-h-[44vh]">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((question, index) => {
                        const isActive = index === currentQuestionIndex
                        const isAnswered = Boolean(
                            selectedAnswers[question.id] ??
                                question.selectedAnswer
                        )

                        const isDoubtful =
                            doubtfulQuestions[question.id] ??
                            question.isDoubtful ??
                            false

                        let statusKey = 'empty'
                        if (isAnswered) statusKey = 'answered'
                        if (isDoubtful) statusKey = 'doubtful'
                        if (isActive) statusKey = 'active'

                        const description = [
                            `Soal ${index + 1}`,
                            isAnswered ? 'sudah dijawab' : 'belum dijawab',
                            isDoubtful ? 'ragu-ragu' : null,
                        ]
                            .filter(Boolean)
                            .join(', ')

                        return (
                            <button
                                key={question.id}
                                type="button"
                                disabled={disabled}
                                onClick={() => onQuestionSelect(index)}
                                aria-label={description}
                                aria-current={isActive ? 'true' : undefined}
                                className={`focus-ring h-12 rounded-xl border text-[12px] font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${STATUS_CLASS[statusKey]}`}
                            >
                                {index + 1}
                            </button>
                        )
                    })}
                </div>
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border pt-4">
                {LEGEND.map((item) => (
                    <li
                        key={item.label}
                        className="flex items-center gap-2 text-[12px] text-muted-foreground"
                    >
                        <span
                            aria-hidden="true"
                            className={`h-3 w-3 shrink-0 rounded border ${item.swatch}`}
                        />
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default CatNavigator