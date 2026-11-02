import { ArrowLeft, Timer } from 'lucide-react'

function CatHeader({
    title = 'Tryout',
    subtitle,
    formattedTime,
    isUrgent = false,
    isFinishing,
    onExit,
    onFinish,
}) {
    return (
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={onExit}
                    aria-label="Keluar dari pengerjaan"
                    className="focus-ring flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <ArrowLeft size={18} aria-hidden="true" />
                    <span className="hidden sm:inline">Keluar</span>
                </button>

                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-[14px] font-bold leading-tight text-foreground">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="truncate text-[12px] text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div
                    role="timer"
                    aria-label="Sisa waktu pengerjaan"
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-[14px] font-bold tabular-nums transition-colors sm:gap-2 sm:px-3 sm:text-[15px] ${
                        isUrgent
                            ? 'bg-destructive/10 text-destructive motion-safe:animate-soft-pulse'
                            : 'bg-muted text-foreground'
                    }`}
                >
                    <Timer size={16} aria-hidden="true" />
                    {formattedTime}
                </div>

                <button
                    type="button"
                    onClick={onFinish}
                    disabled={isFinishing}
                    className="focus-ring h-10 shrink-0 rounded-xl bg-primary-700 px-3 text-[13px] font-semibold text-white transition hover:bg-primary-700/90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
                >
                    Selesai
                </button>
            </div>
        </header>
    )
}

export default CatHeader