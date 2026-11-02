import { Loader2 } from 'lucide-react'

function CatStatusScreen({
    icon: Icon,
    loading = false,
    title,
    message,
    actionLabel,
    onAction,
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 font-user">
            <div
                role={loading ? 'status' : undefined}
                className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-soft"
            >
                {loading ? (
                    <Loader2
                        size={28}
                        aria-hidden="true"
                        className="mx-auto text-primary-700 motion-safe:animate-spin"
                    />
                ) : (
                    Icon && (
                        <Icon
                            size={30}
                            aria-hidden="true"
                            className="mx-auto text-primary-700"
                        />
                    )
                )}

                <h1 className="mt-3 text-[16px] font-bold text-foreground">
                    {title}
                </h1>

                {message && (
                    <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                        {message}
                    </p>
                )}

                {actionLabel && (
                    <button
                        type="button"
                        onClick={onAction}
                        className="focus-ring mt-5 h-12 rounded-xl bg-primary-700 px-5 text-[13px] font-semibold text-white transition hover:bg-primary-700/90"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    )
}

export default CatStatusScreen