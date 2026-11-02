
import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
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
        if (!isOpen) return

        reset({
            name: category?.name || '',
            parentId: parentCategory
                ? String(parentCategory.id)
                : category?.parentId
                    ? String(category.parentId)
                    : '',
            description: category?.description || '',
        })
    }, [isOpen, mode, category, parentCategory, reset])

    const isEdit = mode === 'edit'

    const parentLevel = Number(parentCategory?.level)

    const categoryType =
        parentLevel === 1
            ? 'Subcategory'
            : parentLevel === 2
                ? 'Chapter'
                : 'Category'

    const nameError = errors.name?.message || serverErrors.name
    const parentError = serverErrors.parentId
    const descriptionError =
        errors.description?.message || serverErrors.description

    const title = isEdit
        ? `Edit ${categoryType}`
        : `Add ${categoryType}`

    return (
        <Modal
            isOpen={isOpen}
            onClose={isSubmitting ? undefined : onClose}
            title={title}
            description={
                isEdit
                    ? `Update ${categoryType.toLowerCase()} information.`
                    : `Create a new ${categoryType.toLowerCase()}.`
            }
            footer={
                <>
                    <Button
                        variant="soft"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        form="category-form"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Saving...'
                            : isEdit
                                ? `Update ${categoryType}`
                                : `Create ${categoryType}`}
                    </Button>
                </>
            }
        >
            <form
                id="category-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
            >
                <FormField
                    label="Parent Category"
                    htmlFor="category-parent"
                    error={parentError}
                >
                    <div
                        id="category-parent"
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                    >
                        <span className="font-medium text-gray-700">
                            {parentCategory?.name || 'Root Category'}
                        </span>

                        <span className="text-xs font-medium text-gray-500">
                            Automatic
                        </span>
                    </div>

                    <input
                        type="hidden"
                        {...register('parentId')}
                    />
                </FormField>

                <FormField
                    label="Name"
                    htmlFor="category-name"
                    error={nameError}
                >
                    <Input
                        id="category-name"
                        {...register('name')}
                        error={nameError}
                        disabled={isSubmitting}
                        placeholder="Enter category name"
                    />
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
                        placeholder="Enter category description"
                    />
                </FormField>
            </form>
        </Modal>
    )
}

export default CategoryFormModal
