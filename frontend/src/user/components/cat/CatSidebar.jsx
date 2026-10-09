function CatSidebar({
    questions,
    currentQuestionIndex,
    selectedAnswers,
    doubtfulQuestions,
    answeredCount,
    doubtfulCount,
    isSavingProgress,
    onQuestionSelect,
}) {
    const totalQuestions =
        questions?.length || 0

    const isQuestionAnswered = (
        question
    ) => {
        const answer =
            selectedAnswers[question.id] ??
            question.selectedAnswer

        return Boolean(answer)
    }

    return (
        <aside className="space-y-4">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900">
                    Informasi Tryout
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                        <p className="text-xs text-gray-500">
                            Jumlah Soal
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-900">
                            {totalQuestions}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                        <p className="text-xs text-gray-500">
                            Terjawab
                        </p>

                        <p className="mt-1 text-xl font-bold text-gray-900">
                            {answeredCount}
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-gray-900">
                        Navigator Soal
                    </h2>

                    <span className="text-xs text-gray-400">
                        {answeredCount}/{totalQuestions}
                    </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        Terjawab
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full border border-gray-300 bg-white" />
                        Belum dijawab
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        Ragu-ragu
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-5 gap-2">
                    {questions.map(
                        (question, index) => {
                            const isActive =
                                index ===
                                currentQuestionIndex

                            const isAnswered =
                                isQuestionAnswered(
                                    question
                                )

                            const isDoubtful =
                                doubtfulQuestions[
                                question.id
                                ] ??
                                question.isDoubtful ??
                                false

                            let buttonClass =
                                'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'

                            if (isAnswered) {
                                buttonClass =
                                    'border-green-200 bg-green-50 text-green-700'
                            }

                            if (isDoubtful) {
                                buttonClass =
                                    'border-amber-300 bg-amber-50 text-amber-700'
                            }

                            if (isActive) {
                                buttonClass =
                                    'border-blue-600 bg-blue-600 text-white shadow-sm'
                            }

                            return (
                                <button
                                    key={question.id}
                                    type="button"
                                    onClick={() =>
                                        onQuestionSelect(
                                            index
                                        )
                                    }
                                    className={`aspect-square rounded-lg border text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${buttonClass}`}
                                    aria-label={`Buka soal ${index + 1}`}
                                >
                                    {index + 1}
                                </button>
                            )
                        }
                    )}
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Ragu-ragu</span>

                        <span className="font-semibold text-amber-600">
                            {doubtfulCount}
                        </span>
                    </div>
                </div>
            </section>
        </aside>
    )
}

export default CatSidebar