import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'

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
  mode,
  category,
  parentCategory,
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
      parentId:
        mode === 'create' && parentCategory
          ? String(parentCategory.id)
          : category?.parentId
            ? String(category.parentId)
            : '',
      description: category?.description || '',
    })
  }, [isOpen, mode, category, parentCategory, reset])

  const isEdit = mode === 'edit'

  const nameError = errors.name?.message || serverErrors.name
  const parentError = serverErrors.parentId
  const descriptionError =
    errors.description?.message || serverErrors.description

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? undefined : onClose}
      title={isEdit ? 'Edit Category' : 'Add Category'}
      description={
        isEdit ? 'Update category information.' : 'Create a new category.'
      }
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : isEdit
                ? 'Update Category'
                : 'Create Category'}
          </Button>
        </>
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField label="Name" htmlFor="category-name" error={nameError}>
          <Input
            id="category-name"
            {...register('name')}
            error={nameError}
            disabled={isSubmitting}
            placeholder="Example: Nasionalisme"
          />
        </FormField>

        <FormField
          label="Parent Category"
          htmlFor="category-parent"
          error={parentError}
        >
          <Select
            id="category-parent"
            {...register('parentId')}
            error={parentError}
            disabled={isSubmitting}
          >
            <option value="">No Parent</option>

            {parentCategories.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Description"
          htmlFor="category-description"
          error={descriptionError}
        >
          <Textarea
            id="category-description"
            rows={4}
            {...register('description')}
            error={descriptionError}
            disabled={isSubmitting}
            placeholder="Category description"
          />
        </FormField>
      </form>
    </Modal>
  )
}

export default CategoryFormModal