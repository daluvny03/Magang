import { Edit, MoreVertical, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const item =
  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition'

function CategoryActionMenu({ category, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const run = (callback) => {
    setOpen(false)
    callback?.(category)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Actions for ${category.name}`}
        title="Actions"
        className="rounded-lg p-1.5 text-gray-500 transition hover:bg-primary-100 hover:text-primary-700"
      >
        <MoreVertical size={17} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-100">
          <button
            type="button"
            onClick={() => run(onEdit)}
            className={`${item} text-gray-700 hover:bg-primary-50 hover:text-primary-700`}
          >
            <Edit size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => run(onDelete)}
            className={`${item} text-red-600 hover:bg-red-50`}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default CategoryActionMenu