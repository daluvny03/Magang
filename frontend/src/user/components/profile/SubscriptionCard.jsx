import {
  CalendarDays,
  Crown,
  RefreshCw,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatSubscriptionDate as formatDate } from '../../utils/subscription-date'

function SubscriptionCard({ subscription }) {
  if (!subscription) return null

  const tier = subscription.tier

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Crown size={22} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Langganan Saya
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {tier?.name || 'Subscription'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Level {tier?.level || '-'}
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          Aktif
        </span>
      </div>

      {tier?.description && (
        <p className="mt-5 text-sm leading-6 text-gray-500">
          {tier.description}
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarDays size={17} />

            <span className="text-xs font-medium uppercase tracking-wide">
              Mulai
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-gray-900">
            {formatDate(subscription.startedAt)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarDays size={17} />

            <span className="text-xs font-medium uppercase tracking-wide">
              Berakhir
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-gray-900">
            {formatDate(subscription.expiredAt)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
        <Link
          to="/user/subscription"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50"
        >
          <RefreshCw size={16} />
          {tier?.slug === 'premium' ? 'Perpanjang Premium' : 'Lihat Paket'}
        </Link>
      </div>

      <p className="mt-3 text-center text-xs text-gray-400">
        Kelola pembelian dan perpanjangan melalui halaman langganan.
      </p>
    </section>
  )
}

export default SubscriptionCard
