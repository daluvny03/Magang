import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { flattenCategoryTree } from '../../../utils/flattenCategoryTree'
import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

import CategoryDeleteDialog from '../../../components/category/CategoryDeleteDialog'
import CategoryFormModal from '../../../components/category/CategoryFormModal'
import CategoryTree from '../../../components/category/CategoryTree'


import {
    useCategoryTree,
    useCreateCategory,
    useDeleteCategory,
    useUpdateCategory,
} from '../../../hooks/useCategories'

function CategoryPage() {
    const [search, setSearch] = useState('')

    const [formOpen, setFormOpen] = useState(false)
    const [formMode, setFormMode] = useState('create')
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedParentCategory, setSelectedParentCategory] =
        useState(null)

    const [deleteCategory, setDeleteCategory] = useState(null)

    const categoriesQuery = useCategoryTree({
        ...(search.trim()
            ? { search: search.trim() }
            : {}),
    })

    const createMutation = useCreateCategory()
    const updateMutation = useUpdateCategory()
    const deleteMutation = useDeleteCategory()

    const response = categoriesQuery.data

    const categories = response?.data || []

    const parentCategories = useMemo(
        () => flattenCategoryTree(categories),
        [categories],
    )

    const handleSearch = (event) => {
        setSearch(event.target.value)
    }

    const openCreateModal = (parent = null) => {
        setFormMode('create')
        setSelectedCategory(null)
        setSelectedParentCategory(parent)
        setFormOpen(true)
    }

    const openEditModal = (category) => {
        setFormMode('edit')
        setSelectedCategory(category)
        setSelectedParentCategory(null)
        setFormOpen(true)
    }

    const closeFormModal = () => {
        if (
            createMutation.isPending ||
            updateMutation.isPending
        ) {
            return
        }

        setFormOpen(false)
        setSelectedCategory(null)
        setSelectedParentCategory(null)
    }

    const handleSubmit = async (values) => {
        const parentId =
            formMode === 'create' && selectedParentCategory
                ? selectedParentCategory.id
                : values.parentId
                    ? Number(values.parentId)
                    : null

        const payload = {
            name: values.name.trim(),
            parentId,
            description: values.description?.trim() || null,
        }

        try {
            if (formMode === 'edit') {
                await updateMutation.mutateAsync({
                    id: selectedCategory.id,
                    payload,
                })

                toast.success(
                    'Category updated successfully',
                )
            } else {
                await createMutation.mutateAsync(payload)

                toast.success(
                    'Category created successfully',
                )
            }

            closeFormModal()
        } catch (error) {
            const message =
                error.response?.data?.message ||
                'Failed to save category'

            toast.error(message)
        }
    }

    const handleDelete = async () => {
        if (!deleteCategory) {
            return
        }

        try {
            await deleteMutation.mutateAsync(
                deleteCategory.id,
            )

            toast.success(
                'Category deleted successfully',
            )

            setDeleteCategory(null)
        } catch (error) {
            const message =
                error.response?.data?.message ||
                'Failed to delete category'

            toast.error(message)
        }
    }

    const serverErrors =
        createMutation.error?.response?.data?.errors ||
        updateMutation.error?.response?.data?.errors ||
        []

    const normalizedServerErrors =
        serverErrors.reduce((result, item) => {
            if (item.field) {
                result[item.field] = item.message
            }

            return result
        }, {})

    const isSaving =
        createMutation.isPending ||
        updateMutation.isPending

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Categories
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage question categories and their hierarchy.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 p-4">
                    <div className="relative max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search categories..."
                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-900"
                        />
                    </div>
                </div>

                {categoriesQuery.isLoading ? (
                    <LoadingSpinner text="Loading categories..." />
                ) : categoriesQuery.isError ? (
                    <ErrorState
                        message={
                            categoriesQuery.error?.response?.data
                                ?.message ||
                            'Failed to load categories.'
                        }
                        onRetry={() => categoriesQuery.refetch()}
                    />
                ) : categories.length === 0 ? (
                    <EmptyState
                        title="No categories found"
                        description={
                            search
                                ? 'No categories match your search.'
                                : 'Create your first category.'
                        }
                    />
                ) : (
                    <CategoryTree
                        categories={categories}
                        search={search}
                        onEdit={openEditModal}
                        onDelete={setDeleteCategory}
                        onAddChild={openCreateModal}
                    />
                )}
            </div>

            <CategoryFormModal
                isOpen={formOpen}
                mode={formMode}
                category={selectedCategory}
                parentCategory={selectedParentCategory}
                parentCategories={parentCategories}
                isSubmitting={isSaving}
                serverErrors={normalizedServerErrors}
                onClose={closeFormModal}
                onSubmit={handleSubmit}
            />

            <CategoryDeleteDialog
                category={deleteCategory}
                isDeleting={deleteMutation.isPending}
                onClose={() => setDeleteCategory(null)}
                onConfirm={handleDelete}
            />
        </div>
    )
}

export default CategoryPage