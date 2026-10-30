
import { X, Layers3 } from 'lucide-react'
import { useModalFocus } from '../../hooks/useModalFocus'

const formatPrice = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const formatDuration = (duration) => {
  if (!duration) return 'Tidak berlaku'

  const units = {
    day: 'hari',
    month: 'bulan',
    year: 'tahun',
  }

  return `${duration.value} ${units[duration.unit] || duration.unit}`
}

function SubscriptionDetailModal({ tier, onClose }) {
  const dialogRef = useModalFocus(onClose, false)

  if (!tier) return null

  const inheritedTiers = tier.inheritedTiers ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-detail-title"
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2
              id="subscription-detail-title"
              className="text-lg font-semibold text-gray-900"
            >
              Detail Subscription
            </h2>
            <p className="text-sm text-gray-500">
              Informasi dan hak akses tier.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail"
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold">
                {tier.name}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  tier.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {tier.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {tier.slug}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-500">Harga</p>
              <p className="mt-1 font-semibold">
                {formatPrice(tier.price)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Level</p>
              <p className="mt-1 font-semibold">
                Level {tier.level}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Durasi</p>
              <p className="mt-1 font-semibold">
                {formatDuration(tier.duration)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                ID Subscription Tier
              </p>
              <p className="mt-1 font-semibold">
                {tier.id}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">
              Deskripsi
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              {tier.description || 'Tidak ada deskripsi.'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers3 size={18} className="text-primary-600" />
              <h4 className="text-sm font-semibold">
                Subscription yang Diwarisi
              </h4>
            </div>

            {inheritedTiers.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                Tidak ada direct inheritance.
              </p>
            ) : (
              <div className="space-y-2">
                {inheritedTiers.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.slug}
                      </p>
                    </div>

                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
                      Level {item.level}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Daftar ini menampilkan inheritance langsung.
              Inheritance transitif tetap diperhitungkan
              oleh backend saat menentukan hak akses.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Tutup
          </button>
        </div>
      </section>
    </div>
  )
}

export default SubscriptionDetailModal
