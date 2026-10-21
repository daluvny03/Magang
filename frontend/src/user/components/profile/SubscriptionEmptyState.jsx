import {
  Crown,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

        <Link
          to="/user/subscription"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-100"
        >
          <TrendingUp size={16} />
          Lihat Paket
        </Link>

        <p className="mt-3 text-xs text-gray-400">
          Paket Free tetap tersedia. Lihat paket untuk membeli Premium.
        </p>
      </div>
    </section>
  )
}

export default SubscriptionEmptyState
