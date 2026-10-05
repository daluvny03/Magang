import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

function SortIcon({ active, direction }) {
  if (!active) return <ChevronsUpDown size={13} className="text-gray-300" />
  return direction === 'asc' ? (
    <ArrowUp size={13} className="text-primary-600" />
  ) : (
    <ArrowDown size={13} className="text-primary-600" />
  )
}

/**
 * columns: [{ key, header, render?(row), sortable?, hideable?, className? }]
 * sort:    { key, direction }  (opsional)
 */
function DataTable({
  columns,
  data,
  rowKey = 'id',
  sort,
  onSort,
  columnToggle = false,
}) {
  const [hidden, setHidden] = useState([])

  const toggleColumn = (key) =>
    setHidden((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )

  const visibleColumns = columns.filter((c) => !hidden.includes(c.key))
  const hideableColumns = columns.filter((c) => c.hideable !== false && c.header)

  const handleSort = (key) => {
    if (!onSort) return
    const direction =
      sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc'
    onSort({ key, direction })
  }

  return (
    <div className="space-y-3">
      {columnToggle && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Show / hide:</span>
          {hideableColumns.map((col) => {
            const isHidden = hidden.includes(col.key)
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => toggleColumn(col.key)}
                className={`rounded-lg border px-3 py-1 text-xs transition ${
                  isHidden
                    ? 'border-gray-200 text-gray-400'
                    : 'border-primary-500 text-primary-600 hover:bg-primary-50'
                }`}
              >
                {col.header}
              </button>
            )
          })}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold text-gray-900 ${
                    col.className || ''
                  }`}
                >
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1.5"
                    >
                      {col.header}
                      <SortIcon
                        active={sort?.key === col.key}
                        direction={sort?.direction}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr
                key={row[rowKey]}
                className="border-b border-gray-50 transition hover:bg-primary-50"
              >
                {visibleColumns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-4 text-gray-600 ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable