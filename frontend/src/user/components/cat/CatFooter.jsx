import {
    ArrowLeft,
    ArrowRight,
    BookmarkCheck,
    Flag,
    LayoutGrid,
    Send,
} from 'lucide-react'

const baseButton =
    'focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl px-3 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 lg:px-5'
function CatFooter({
    isFirstQuestion,
    isLastQuestion,
    isDoubtful,
    isSavingProgress,
    answeredCount,
    totalQuestions,
    onPrevious,
    onNext,
    onFinish,
    onToggleDoubtful,
    onOpenNavigator,
}) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div className="mx-auto flex max-w-[1600px] items-center gap-2 lg:max-w-none lg:justify-between lg:gap-3">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isFirstQuestion || isSavingProgress}
                    className={`${baseButton} border border-border bg-card text-foreground hover:bg-muted`}
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                    <span className="sr-only lg:not-sr-only">Sebelumnya</span>
                </button>

                <button
                    type="button"
                    onClick={onToggleDoubtful}
                    aria-pressed={isDoubtful}
                    className={`${baseButton} border ${
                        isDoubtful
                            ? 'border-amber-400 bg-amber-50 text-amber-800'
                            : 'border-border bg-card text-foreground hover:bg-muted'
                    }`}
                >
                    {isDoubtful ? (
                        <BookmarkCheck size={18} aria-hidden="true" />
                    ) : (
                        <Flag size={18} aria-hidden="true" />
                    )}
                    <span className="sr-only lg:not-sr-only">
                        Tandai ragu-ragu
                    </span>
                </button>

                <button
                    type="button"
                    onClick={onOpenNavigator}
                    className={`${baseButton} min-w-0 flex-1 border border-border bg-card text-foreground hover:bg-muted lg:hidden`}
                >
                    <LayoutGrid size={18} aria-hidden="true" />
                    <span className="truncate">
                        {answeredCount}/{totalQuestions} terjawab
                    </span>
                </button>

                <button
                    type="button"
                    onClick={isLastQuestion ? onFinish : onNext}
                    disabled={isSavingProgress}
                    className={`${baseButton} bg-primary-700 text-white hover:bg-primary-700/90`}
                >
                    <span className="sr-only lg:not-sr-only">
                        {isLastQuestion ? 'Selesai' : 'Selanjutnya'}
                    </span>
                    {isLastQuestion ? (
                        <Send size={18} aria-hidden="true" />
                    ) : (
                        <ArrowRight size={18} aria-hidden="true" />
                    )}
                </button>
            </div>
        </div>
    )
}

export default CatFooter