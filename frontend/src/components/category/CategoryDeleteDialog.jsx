import { AlertTriangle, X } from 'lucide-react'

function CategoryDeleteDialog({
  category,
  isDeleting,
  onClose,
  onConfirm,
}) {
  if (!category) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle
                size={22}
                className="text-red-600"
              />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Delete Category
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{' '}
            <strong>{category.name}</strong>?
          </p>
        </div>

        <div className="flex justify-end gap-3 p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isDeleting
              ? 'Deleting...'
              : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoryDeleteDialog