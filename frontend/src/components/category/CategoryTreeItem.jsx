import {
  ChevronDown,
  ChevronRight,
  Edit,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Badge from '../ui/Badge'

const menuItem =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition'

function CategoryTreeItem({
  category,
  level,
  search,
  onEdit,
  onDelete,
  onAddChild,
}) {
  const [isExpanded, setIsExpanded] = useState(Boolean(search?.trim()))
  const [isActionOpen, setIsActionOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (search?.trim()) {
      setIsExpanded(true)
    }
  }, [search])

  // Tutup menu aksi saat klik di luar
  useEffect(() => {
    if (!isActionOpen) return

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsActionOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActionOpen])

  const hasChildren = category.children?.length > 0

  const handleToggle = () => {
    if (!hasChildren) return
    setIsExpanded((current) => !current)
  }

  const handleAction = (callback) => {
    setIsActionOpen(false)
    if (callback) callback(category)
  }

  return (
    <div>
      <div
        className="group flex items-center gap-2 py-3 pr-5 transition hover:bg-primary-50"
        style={{ paddingLeft: `${20 + level * 28}px` }}
      >
        <button
          type="button"
          onClick={handleToggle}
          disabled={!hasChildren}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
            hasChildren
              ? 'text-gray-500 hover:bg-primary-100 hover:text-primary-700'
              : 'cursor-default text-transparent'
          }`}
          aria-label={
            hasChildren
              ? isExpanded
                ? 'Collapse category'
                : 'Expand category'
              : undefined
          }
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown size={17} />
            ) : (
              <ChevronRight size={17} />
            ))}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`truncate text-sm text-gray-900 ${
                level === 0 ? 'font-semibold' : 'font-medium'
              }`}
            >
              {category.name}
            </span>

            <Badge tone={category.is_active ? 'green' : 'gray'}>
              {category.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {category.description && (
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {category.description}
            </p>
          )}
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsActionOpen((current) => !current)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-primary-100 hover:text-primary-700"
            aria-label={`Actions for ${category.name}`}
            title="Actions"
          >
            <MoreVertical size={18} />
          </button>

          {isActionOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-100">
              <button
                type="button"
                onClick={() => handleAction(onAddChild)}
                className={`${menuItem} text-gray-700 hover:bg-primary-50 hover:text-primary-700`}
              >
                <Plus size={16} />
                Add Child
              </button>

              <button
                type="button"
                onClick={() => handleAction(onEdit)}
                className={`${menuItem} text-gray-700 hover:bg-primary-50 hover:text-primary-700`}
              >
                <Edit size={16} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleAction(onDelete)}
                className={`${menuItem} text-red-600 hover:bg-red-50`}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              search={search}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryTreeItem