const number = new Intl.NumberFormat('id-ID')

const statusItems = [
  { key: 'active', label: 'Aktif' },
  { key: 'upcoming', label: 'Belum dimulai' },
  { key: 'expired', label: 'Kedaluwarsa' },
  { key: 'cancelled', label: 'Dibatalkan' },
]

function SubscriptionDistribution({
  distribution = [],
  onOpen,
}) {
  if (distribution.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
        <p className="text-sm text-gray-500">
          Tidak ada data distribusi subscription pada periode ini.
        </p>
      </div>
    )
  }

  const sortedDistribution = [...distribution].sort((a, b) => {
    if (a.tierId === 'all') return -1
    if (b.tierId === 'all') return 1

    return Number(a.tierLevel) - Number(b.tierLevel)
      || Number(a.tierId) - Number(b.tierId)
  })

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Subscription Distribution
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Distribusi user berdasarkan paket dan status subscription.
          User tanpa subscription dihitung ke dalam Free.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sortedDistribution.map((item) => (
          <div
            key={item.tierId}
            onClick={() => onOpen(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' ||
                event.key === ' '
              ) {
                event.preventDefault()
                onOpen(item)
              }
            }}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition hover:border-primary-200 hover:shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  {item.tierId === 'all'
                    ? 'Total User'
                    : 'Subscription Tier'}
                </p>

                <h3 className="mt-1 font-semibold text-gray-900">
                  {item.tierName}
                </h3>
              </div>

              <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                {item.tierId === 'all'
                  ? 'Semua'
                  : `Tier ${item.tierId}`}
              </span>
            </div>

            <p className="mt-4 text-2xl font-semibold text-gray-900">
              {number.format(Number(item.total || 0))}
            </p>

            <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
              {statusItems.map((status) => (
                <div
                  key={status.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-500">
                    {status.label}
                  </span>

                  <span className="font-medium text-gray-700">
                    {number.format(
                      Number(item[status.key] || 0)
                    )}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs font-medium text-primary-600">
              Lihat user →
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default SubscriptionDistribution