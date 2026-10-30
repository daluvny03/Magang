import { useModalFocus } from '../../hooks/useModalFocus'
import { AlertTriangle, Power, PowerOff, X } from 'lucide-react'

function SubscriptionStatusDialog({
  tier,
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  const dialogRef = useModalFocus(onClose, isSubmitting, Boolean(tier))
  if (!tier) return null
  const isDeactivating = tier.isActive

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="alertdialog"
        ref={dialogRef}
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="subscription-status-title"
        aria-describedby="subscription-status-description"
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-3 ${
                isDeactivating
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
              }`}
            >
              {isDeactivating ? (
                <PowerOff size={22} />
              ) : (
                <Power size={22} />
              )}
            </div>

            <h2
              id="subscription-status-title"
              className="text-lg font-semibold text-gray-900"
            >
              {isDeactivating
                ? 'Nonaktifkan Subscription'
                : 'Aktifkan Subscription'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup dialog"
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p
            id="subscription-status-description"
            className="text-sm leading-relaxed text-gray-600"
          >
            Apakah Anda yakin ingin{' '}
            <strong>
              {isDeactivating ? 'menonaktifkan' : 'mengaktifkan'}
            </strong>{' '}
            subscription{' '}
            <strong className="text-gray-900">
              {tier.name}
            </strong>
            ?
          </p>

          {isDeactivating && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <p className="text-xs leading-relaxed text-amber-800">
                Tier ini tidak akan ditampilkan pada
                katalog subscription User dan tidak dapat
                digunakan untuk checkout baru. Subscription
                yang sudah aktif tidak otomatis dibatalkan.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              isDeactivating
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting
              ? 'Memproses...'
              : isDeactivating
                ? 'Ya, Nonaktifkan'
                : 'Ya, Aktifkan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionStatusDialog
