import { RotateCcw, Search } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

function QuestionFilters({
  search,
  categoryId,
  isActive,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onReset,
}) {
  const hasFilter = search || categoryId || isActive !== 'true'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-72">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={search}
          onChange={onSearchChange}
          placeholder="Search question..."
          className="pl-9"
        />
      </div>

      <div className="w-full sm:w-52">
        <Select value={categoryId} onChange={onCategoryChange}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-full sm:w-36">
        <Select value={isActive} onChange={onStatusChange}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
          <option value="">All Status</option>
        </Select>
      </div>

      {hasFilter && (
        <Button variant="soft" onClick={onReset}>
          <RotateCcw size={15} />
          Reset
        </Button>
      )}
    </div>
  )
}

export default QuestionFilters