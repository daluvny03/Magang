import { useEffect } from 'react'
import { X } from 'lucide-react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must not exceed 100 characters'),

  parentId: z.string().optional(),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
})

function CategoryFormModal({
  isOpen,
  mode = 'create',
  category,
  parentCategories = [],
  isSubmitting,
  serverErrors = {},
  onClose,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      parentId: '',
      description: '',
    },
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    reset({
      name: category?.name || '',
      parentId: category?.parentId
        ? String(category.parentId)
        : '',
      description: category?.description || '',
    })
  }, [isOpen, category, reset])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'edit'
                ? 'Edit Category'
                : 'Add Category'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {mode === 'edit'
                ? 'Update category information.'
                : 'Create a new category.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 p-6"
        >
          <div>
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <input
              id="category-name"
              {...register('name')}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-gray-900"
              placeholder="Example: Nasionalisme"
            />

            {errors.name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.name.message}
              </p>
            )}

            {serverErrors.name && (
              <p className="mt-1 text-sm text-red-500">
                {serverErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="category-parent"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Parent Category
            </label>

            <select
              id="category-parent"
              {...register('parentId')}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-gray-900"
            >
              <option value="">
                No Parent
              </option>

              {parentCategories.map((parent) => (
                <option
                  key={parent.id}
                  value={parent.id}
                >
                  {parent.name}
                </option>
              ))}
            </select>

            {serverErrors.parentId && (
              <p className="mt-1 text-sm text-red-500">
                {serverErrors.parentId}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="category-description"
              rows={4}
              {...register('description')}
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-gray-900"
              placeholder="Category description"
            />

            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}

            {serverErrors.description && (
              <p className="mt-1 text-sm text-red-500">
                {serverErrors.description}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : mode === 'edit'
                  ? 'Update Category'
                  : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryFormModal