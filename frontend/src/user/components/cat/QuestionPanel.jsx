function QuestionPanel({
    question,
    currentNumber,
    totalQuestions,
    selectedAnswer,
    onSelectAnswer,
    isSavingAnswer,
}) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:p-7">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                <h2 className="text-lg font-bold text-gray-900">
                    Soal Nomor{' '}
                    <span className="ml-1 text-blue-600">
                        {currentNumber}
                    </span>
                </h2>

                <span className="text-xs font-medium text-gray-400">
                    {currentNumber} dari {totalQuestions}
                </span>
            </div>

            <div className="pt-6">
                {question.questionImage && (
                    <img
                        src={question.questionImage}
                        alt="Soal"
                        className="mb-6 max-h-96 max-w-full rounded-xl object-contain"
                    />
                )}

                <p className="whitespace-pre-line text-base leading-8 text-gray-800">
                    {question.questionText}
                </p>

                <div className="mt-7 space-y-3">
                    {question.answerOptions?.map(
                        (option) => {
                            const isSelected =
                                selectedAnswer ===
                                option.key

                            return (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() =>
                                        onSelectAnswer(
                                            option.key
                                        )
                                    }
                                    className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition disabled:cursor-wait disabled:opacity-70 ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <span
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${isSelected
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : 'border-gray-200 bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        {option.key}
                                    </span>

                                    <span className="pt-1.5 text-sm font-medium leading-6 text-gray-700">
                                        {option.text}
                                    </span>
                                </button>
                            )
                        }
                    )}
                </div>
            </div>
        </section>
    )
}

export default QuestionPanel