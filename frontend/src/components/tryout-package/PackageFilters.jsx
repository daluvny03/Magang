import { RotateCcw, Search } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'

function PackageFilters({ search, onSearchChange, onReset }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-full max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder="Search package..."
          className="pl-9"
        />
      </div>

      {search && (
        <Button variant="soft" onClick={onReset}>
          <RotateCcw size={15} />
          Reset
        </Button>
      )}
    </div>
  )
}

export default PackageFilters