import CatNavigator from './CatNavigator'

function CatSidebar({
    questions,
    currentQuestionIndex,
    selectedAnswers,
    doubtfulQuestions,
    answeredCount,
    doubtfulCount,
    isSavingProgress,
    onQuestionSelect,
    className = '',
}) {
    const totalQuestions = questions?.length || 0
    const unansweredCount = Math.max(totalQuestions - answeredCount, 0)

    const infoTiles = [
        { label: 'Jumlah soal', value: totalQuestions, tone: 'text-foreground' },
        { label: 'Terjawab', value: answeredCount, tone: 'text-primary-700' },
        { label: 'Belum dijawab', value: unansweredCount, tone: 'text-muted-foreground' },
        { label: 'Ragu-ragu', value: doubtfulCount, tone: 'text-amber-700' },
    ]

    return (
        <aside
            aria-label="Navigasi soal dan informasi tryout"
            className={`space-y-4 ${className}`}
        >
            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-[14px] font-bold text-foreground">
                        Navigasi Soal
                    </h2>

                    <span className="text-[12px] text-muted-foreground">
                        {answeredCount}/{totalQuestions} terjawab
                    </span>
                </div>

                <div className="mt-4">
                    <CatNavigator
                        questions={questions}
                        currentQuestionIndex={currentQuestionIndex}
                        selectedAnswers={selectedAnswers}
                        doubtfulQuestions={doubtfulQuestions}
                        disabled={isSavingProgress}
                        onQuestionSelect={onQuestionSelect}
                    />
                </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <h2 className="text-[14px] font-bold text-foreground">
                    Informasi Tryout
                </h2>

                <dl className="mt-4 grid grid-cols-2 gap-2.5">
                    {infoTiles.map((tile) => (
                        <div
                            key={tile.label}
                            className="rounded-xl bg-muted/70 px-3 py-3 text-center"
                        >
                            <dd className={`text-[20px] font-bold leading-none ${tile.tone}`}>
                                {tile.value}
                            </dd>

                            <dt className="mt-1.5 text-[11px] text-muted-foreground">
                                {tile.label}
                            </dt>
                        </div>
                    ))}
                </dl>
            </section>
        </aside>
    )
}

export default CatSidebar