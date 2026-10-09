import { AlertTriangle, X } from 'lucide-react'

function FinishConfirmModal({
    isOpen,
    answeredCount,
    unansweredCount,
    doubtfulCount,
    isSubmitting,
    onClose,
    onConfirm,
}) {
    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-gray-100 p-5">
                    <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>

                        <div>
                            <h2 className="font-bold text-gray-900">
                                Selesaikan Tryout?
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Pastikan jawaban Anda sudah sesuai sebelum menyelesaikan tryout.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-green-50 p-3 text-center">
                            <p className="text-xl font-bold text-green-700">
                                {answeredCount}
                            </p>

                            <p className="mt-1 text-xs text-green-600">
                                Terjawab
                            </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-3 text-center">
                            <p className="text-xl font-bold text-gray-700">
                                {unansweredCount}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Belum
                            </p>
                        </div>

                        <div className="rounded-xl bg-amber-50 p-3 text-center">
                            <p className="text-xl font-bold text-amber-700">
                                {doubtfulCount}
                            </p>

                            <p className="mt-1 text-xs text-amber-600">
                                Ragu-ragu
                            </p>
                        </div>
                    </div>

                    {unansweredCount > 0 && (
                        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                            Masih ada {unansweredCount} soal yang belum dijawab.
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onClose}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Kembali
                    </button>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting
                            ? 'Menyelesaikan...'
                            : 'Selesaikan Tryout'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FinishConfirmModal