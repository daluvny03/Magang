import { Search, X } from 'lucide-react'

function PackageFilters({ search, onSearchChange, onReset }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Search package..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {search && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <X size={16} />
            Reset Filter
          </button>
        </div>
      )}
    </div>
  )
}

export default PackageFilters
