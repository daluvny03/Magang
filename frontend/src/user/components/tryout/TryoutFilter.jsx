const FILTER_OPTIONS = [
  {
    value: 'all',
    label: 'Semua',
  },
  {
    value: 'accessible',
    label: 'Bisa Diakses',
  },
  {
    value: 'free',
    label: 'Gratis',
  },
  {
    value: 'locked',
    label: 'Terkunci',
  },
]

function TryoutFilter({
  value,
  onChange,
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {FILTER_OPTIONS.map((option) => {
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-primary-600 text-white'
                : 'border border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:text-primary-700'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default TryoutFilter