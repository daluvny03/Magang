import {
  Crown,
  TrendingUp,
} from 'lucide-react'

function SubscriptionEmptyState() {
  return (
    <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 sm:p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
          <Crown size={22} />
        </div>

        <h2 className="mt-4 text-lg font-bold text-gray-900">
          Tidak Ada Langganan Aktif
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Saat ini tidak ada paket langganan aktif pada akunmu.
        </p>

        <button
          type="button"
          disabled
          className="mt-5 inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-400"
        >
          <TrendingUp size={16} />
          Lihat Paket
        </button>

        <p className="mt-3 text-xs text-gray-400">
          Fitur pembelian paket akan tersedia pada tahap berikutnya.
        </p>
      </div>
    </section>
  )
}

export default SubscriptionEmptyState