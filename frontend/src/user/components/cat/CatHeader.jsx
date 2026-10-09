function CatHeader({
    formattedTime,
    onFinish,
    isFinishing,
}) {
    return (
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
            <div className="mx-auto flex min-h-20 max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                        Simulasi CAT CPNS
                    </p>

                    <h1 className="mt-1 truncate text-base font-bold text-gray-900 lg:text-lg">
                        Tryout
                    </h1>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden rounded-xl border border-blue-100 bg-blue-50 px-5 py-2 text-center sm:block">
                        <p className="text-xs text-gray-500">
                            Sisa waktu
                        </p>

                        <p className="mt-0.5 font-mono font-bold text-gray-900">
                            {formattedTime}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onFinish}
                        disabled={isFinishing}
                        className="rounded-xl bg-blue-300 px-4 py-2.5 text-sm font-semibold text-gray-900"
                    >
                        Selesaikan Tryout
                    </button>
                </div>
            </div>
        </header>
    )
}

export default CatHeader