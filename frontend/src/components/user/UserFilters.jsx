import { RotateCcw } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

function UserFilters({
  search,
  limit,
  onSearchChange,
  onLimitChange,
  onReset,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
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
  )
}

export default UserFilters
