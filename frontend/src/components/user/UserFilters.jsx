
import { RotateCcw } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

function UserFilters({
  search,
  limit,
  startDate,
  endDate,
  onSearchChange,
  onLimitChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-20">
            <Select value={limit} onChange={onLimitChange}>
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>
          entries per page
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <span className="text-xs text-gray-500">Search:</span>

          <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
            <Input
              value={search}
              onChange={onSearchChange}
              placeholder="Name or email"
            />
          </div>

          <Button variant="soft" onClick={onReset}>
            <RotateCcw size={15} />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-48">
          <label
            htmlFor="startDate"
            className="mb-1.5 block text-xs font-medium text-gray-600"
          >
            Activation Start Date
          </label>

          <input
            id="startDate"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="w-full sm:w-48">
          <label
            htmlFor="endDate"
            className="mb-1.5 block text-xs font-medium text-gray-600"
          >
            Activation End Date
          </label>

          <input
            id="endDate"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  )
}

export default UserFilters
