import { RotateCcw, Search } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import CategorySearchSelect from './CategorySearchSelect'

function QuestionFilters({
  search,
  categoryId,
  isActive,
  categories,
  isCategoriesLoading,
  isCategoriesError,
  onRetryCategories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onReset,
}) {
  const hasFilter = search || categoryId || isActive !== 'true'

  return (
    <div className="flex flex-wrap items-start gap-3">
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

      <div className="w-full sm:w-80">
        <label htmlFor="question-category-filter" className="sr-only">Filter kategori</label>
        <CategorySearchSelect
          id="question-category-filter"
          categories={categories}
          value={categoryId}
          onChange={onCategoryChange}
          isLoading={isCategoriesLoading}
          isError={isCategoriesError}
          onRetry={() => onRetryCategories?.()}
          required={false}
          floating
        />
        {categoryId && (
          <Button type="button" variant="soft" className="mt-2" onClick={() => onCategoryChange('')}>
            Semua kategori
          </Button>
        )}
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
