function CatFooter({
    isFirstQuestion,
    isLastQuestion,
    isDoubtful,
    isSavingProgress,
    onPrevious,
    onNext,
    onToggleDoubtful,
}) {
    return (
        <footer className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={
                        isFirstQuestion ||
                        isSavingProgress
                    }
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Sebelumnya
                </button>

                <button
                    type="button"
                    onClick={onToggleDoubtful}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${isDoubtful
                        ? 'border-amber-400 bg-amber-50 text-amber-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {isDoubtful
                        ? 'Batalkan Ragu-ragu'
                        : 'Ragu-ragu'}
                </button>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={
                        isLastQuestion ||
                        isSavingProgress
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                >
                    Selanjutnya
                </button>
            </div>
        </footer>
    )
}

export default CatFooter