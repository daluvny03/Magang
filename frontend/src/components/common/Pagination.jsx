import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

function getPageItems(page, totalPages) {
  const sorted = [...new Set([1, totalPages, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const items = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push(`gap-${p}`)
    items.push(p)
  })
  return items
}

const navButton =
  'flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

function Pagination({ page: rawPage, totalPages: rawTotalPages, onPageChange, total, limit }) {
  // Paksa menjadi angka, karena API bisa mengirim string
  const page = Number(rawPage) || 1
  const totalPages = Number(rawTotalPages) || 0

  if (!totalPages) return null

  const showInfo = total !== undefined && Boolean(limit)
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, Number(total))

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs text-gray-500">
        {showInfo
          ? `Showing ${from} to ${to} of ${total} entries`
          : `Page ${page} of ${totalPages}`}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={navButton}
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          className={navButton}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="px-1 text-xs text-gray-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`h-8 min-w-8 rounded-md px-2 text-xs font-medium transition ${
                item === page
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-primary-50'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className={navButton}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          className={navButton}
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default Pagination