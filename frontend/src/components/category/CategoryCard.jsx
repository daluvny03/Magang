import { ChevronDown, ChevronRight, FolderTree, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import Badge from '../ui/Badge'
import IconButton from '../ui/IconButton'
import CategoryActionMenu from './CategoryActionMenu'

// Auto-buka saat sedang mencari, sama seperti perilaku sebelumnya
function useExpanded(search) {
  const [expanded, setExpanded] = useState(Boolean(search?.trim()))

  useEffect(() => {
    if (search?.trim()) setExpanded(true)
  }, [search])

  return [expanded, setExpanded]
}

function AddChildButton({ category, onAddChild }) {
  return (
    <IconButton
      label={`Tambah sub-kategori di ${category.name}`}
      onClick={() => onAddChild(category)}
      className="p-1.5 text-primary-600 hover:bg-primary-100"
    >
      <Plus size={17} />
    </IconButton>
  )
}

function ChildRow({ category, search, onAddChild, ...menuHandlers }) {
  const [expanded, setExpanded] = useExpanded(search)
  const hasChildren = category.children?.length > 0

  return (
    <div>
      <div className="flex items-center gap-1 rounded-lg py-1 pr-1 transition hover:bg-primary-50">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          disabled={!hasChildren}
          aria-label={expanded ? 'Collapse category' : 'Expand category'}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${
            hasChildren
              ? 'text-gray-500 hover:bg-primary-100 hover:text-primary-700'
              : 'cursor-default text-transparent'
          }`}
        >
          {hasChildren &&
            (expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />)}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-gray-800">{category.name}</p>
        </div>

        {!category.is_active && <Badge>Inactive</Badge>}

        <AddChildButton category={category} onAddChild={onAddChild} />
        <CategoryActionMenu category={category} {...menuHandlers} />
      </div>

      {hasChildren && expanded && (
        <div className="ml-3 border-l border-primary-100 pl-2">
          {category.children.map((child) => (
            <ChildRow
              key={child.id}
              category={child}
              search={search}
              onAddChild={onAddChild}
              {...menuHandlers}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryCard({ category, search, onAddChild, ...menuHandlers }) {
  const [expanded, setExpanded] = useExpanded(search)
  const children = category.children || []
  const childCount = children.length

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card transition hover:border-primary-200">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <FolderTree size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {category.name}
          </p>
          <div className="mt-1">
            <Badge tone={category.is_active ? 'green' : 'gray'}>
              {category.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <AddChildButton category={category} onAddChild={onAddChild} />
          <CategoryActionMenu category={category} {...menuHandlers} />
        </div>
      </div>

      <p className="mt-3 line-clamp-2 min-h-8 text-xs text-gray-500">
        {category.description || 'Tidak ada deskripsi.'}
      </p>

      <div className="mt-3 border-t border-gray-100 pt-3">
        {childCount === 0 ? (
          <button
            type="button"
            onClick={() => onAddChild(category)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 transition hover:text-primary-700"
          >
            <Plus size={14} />
            Tambah sub-kategori
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="flex w-full items-center justify-between text-xs font-medium text-primary-600 transition hover:text-primary-700"
          >
            {childCount} sub-kategori
            {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
        )}

        {childCount > 0 && expanded && (
          <div className="mt-2 space-y-0.5">
            {children.map((child) => (
              <ChildRow
                key={child.id}
                category={child}
                search={search}
                onAddChild={onAddChild}
                {...menuHandlers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryCard