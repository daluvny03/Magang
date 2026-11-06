
import { AlertTriangle, X, WifiOff } from 'lucide-react'
import { useModalFocus } from '@/hooks/useModalFocus'

function FinishConfirmModal({
    isOpen,
    answeredCount,
    unansweredCount,
    doubtfulCount,
    unansweredNumbers = [],
    isSubmitting,
    ping,
    isPingChecking,
    isDisconnected,
    onClose,
    onConfirm,
}) {
    const dialogRef = useModalFocus(onClose, isSubmitting, isOpen)

    if (!isOpen) {
        return null
    }

    const tiles = [
        {
            label: 'Terjawab',
            value: answeredCount,
            box: 'bg-primary-50',
            tone: 'text-primary-700',
        },
        {
            label: 'Belum dijawab',
            value: unansweredCount,
            box: 'bg-muted',
            tone: 'text-muted-foreground',
        },
        {
            label: 'Ragu-ragu',
            value: doubtfulCount,
            box: 'bg-amber-50',
            tone: 'text-amber-800',
        },
    ]

    const networkWarning = isDisconnected
        ? {
            title: 'Koneksi internet terputus',
            description:
                'Perangkat Anda tidak berhasil terhubung ke server. Periksa koneksi internet sebelum melanjutkan. Pastikan jawaban terakhir sudah tersimpan.',
            icon: WifiOff,
            className: 'border-red-200 bg-red-50 text-red-700',
        }
        : ping > 500
            ? {
                title: `Koneksi sangat lambat (${ping} ms)`,
                description:
                    'Komunikasi dengan server membutuhkan waktu cukup lama. Sebaiknya periksa koneksi internet sebelum menyelesaikan tryout.',
                icon: AlertTriangle,
                className: 'border-red-200 bg-red-50 text-red-700',
            }
            : ping > 200
                ? {
                    title: `Koneksi kurang stabil (${ping} ms)`,
                    description:
                        'Respons server sedang lambat. Jika waktu masih tersedia, pertimbangkan menunggu hingga koneksi membaik.',
                    icon: AlertTriangle,
                    className: 'border-amber-200 bg-amber-50 text-amber-800',
                }
                : null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="finish-confirm-title"
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card shadow-xl"
            >
                <div className="flex items-start justify-between gap-3 border-b border-border p-5">
                    <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
                            <AlertTriangle
                                size={20}
                                aria-hidden="true"
                                className="text-amber-600"
                            />
                        </div>

                        <div>
                            <h2
                                id="finish-confirm-title"
                                className="text-[16px] font-bold text-foreground"
                            >
                                Selesaikan Tryout?
                            </h2>

                            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                                Setelah diselesaikan, jawaban tidak bisa diubah lagi.
                                Pastikan jawaban Anda sudah sesuai.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onClose}
                        aria-label="Tutup konfirmasi"
                        className="focus-ring rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                <div className="space-y-3 p-5">
                    <dl className="grid grid-cols-3 gap-2.5">
                        {tiles.map((tile) => (
                            <div
                                key={tile.label}
                                className={`rounded-xl p-3 text-center ${tile.box}`}
                            >
                                <dd className={`text-[22px] font-bold leading-none ${tile.tone}`}>
                                    {tile.value}
                                </dd>

                                <dt className="mt-1.5 text-[11px] text-muted-foreground">
                                    {tile.label}
                                </dt>
                            </div>
                        ))}
                    </dl>

                    {unansweredCount > 0 && (
                        <div className="rounded-xl border border-border p-3.5">
                            <p className="text-[13px] font-semibold text-foreground">
                                Masih ada {unansweredCount} soal yang belum dijawab
                            </p>

                            {unansweredNumbers.length > 0 && (
                                <ul className="mt-2.5 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                                    {unansweredNumbers.map((number) => (
                                        <li
                                            key={number}
                                            className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-muted px-2 text-[12px] font-semibold text-foreground"
                                        >
                                            {number}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {doubtfulCount > 0 && (
                        <p className="rounded-xl bg-amber-50 px-3.5 py-3 text-[13px] leading-5 text-amber-800">
                            Ada {doubtfulCount} soal yang Anda tandai ragu-ragu.
                            Periksa kembali bila masih ada waktu.
                        </p>
                    )}

                    {/* Network Warning */}
                    {networkWarning && (
                        <div
                            role="alert"
                            className={`flex gap-3 rounded-xl border p-3.5 ${networkWarning.className}`}
                        >
                            <networkWarning.icon
                                size={19}
                                className="mt-0.5 shrink-0"
                                aria-hidden="true"
                            />

                            <div>
                                <p className="text-[13px] font-semibold">
                                    {networkWarning.title}
                                </p>

                                <p className="mt-1 text-[12px] leading-5">
                                    {networkWarning.description}
                                </p>

                                <p className="mt-2 text-[12px] font-semibold">
                                    Anda tetap dapat menyelesaikan tryout.
                                </p>
                            </div>
                        </div>
                    )}

                    {!networkWarning && isPingChecking && ping === null && !isDisconnected && (
                        <p className="rounded-xl border border-border bg-muted/50 px-3.5 py-3 text-[12px] text-muted-foreground">
                            Sedang memeriksa kondisi koneksi internet...
                        </p>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onClose}
                        className="focus-ring h-12 rounded-xl border border-border px-5 text-[13px] font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Periksa lagi
                    </button>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                        className="focus-ring h-12 rounded-xl bg-primary-700 px-5 text-[13px] font-semibold text-white hover:bg-primary-700/90 disabled:cursor-not-allowed disabled:opacity-60"
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
