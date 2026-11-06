const STATUS_CLASS = {
    doubtful: 'bg-amber-400 text-amber-950',
    answered: 'bg-emerald-600 text-white shadow-sm',
    empty: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
}

const LEGEND = [
    { label: 'Sedang dibuka', swatch: 'border-2 border-slate-700 bg-card' },
    { label: 'Sudah dijawab', swatch: 'bg-emerald-600' },
    { label: 'Ragu-ragu', swatch: 'bg-amber-400' },
    { label: 'Belum dijawab', swatch: 'bg-slate-100' },
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
                        const activeClass = isActive
                            ? 'border-2 border-slate-700 shadow-sm'
                            : ''

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
                                className={`focus-ring h-12 rounded-xl text-[12px] font-semibold transition-all disabled:cursor-wait disabled:opacity-60 ${STATUS_CLASS[statusKey]} ${activeClass}`}
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
                            className={`h-3 w-3 shrink-0 rounded ${item.swatch}`}
                        />
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default CatNavigator
