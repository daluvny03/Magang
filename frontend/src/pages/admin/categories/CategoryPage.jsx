
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

import { useCategoryTree, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../../../hooks/useCategories'
import { flattenCategoryTree } from '../../../utils/flattenCategoryTree'
import { useDebounce } from '../../../hooks/useDebounce'

import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

import CategoryOverview from '../../../components/category/CategoryOverview'
import CategoryLevelList from '../../../components/category/CategoryLevelList'
import CategoryBreadcrumb from '../../../components/category/CategoryBreadcrumb'
import CategoryFormModal from '../../../components/category/CategoryFormModal'
import CategoryDeleteDialog from '../../../components/category/CategoryDeleteDialog'

// Kategori utama yang diizinkan tampil.
const ROOT_CATEGORY_ORDER = ['TWK', 'TIU', 'TKP']

// Mencari jalur kategori dari root sampai kategori tujuan.
function findCategoryPath(categories, targetId, parents = []) {
    for (const category of categories) {
        const currentPath = [...parents, category]

        if (String(category.id) === String(targetId)) {
            return currentPath
        }

        if (category.children?.length) {
            const result = findCategoryPath(
                category.children,
                targetId,
                currentPath,
            )

            if (result) {
                return result
            }
        }
    }

    return null
}

function CategoryPage() {
    const navigate = useNavigate()
    const { categoryId } = useParams()

    const [searchInput, setSearchInput] = useState('')
    const search = useDebounce(searchInput.trim())

    const [formOpen, setFormOpen] = useState(false)
    const [formMode, setFormMode] = useState('create')
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedParentCategory, setSelectedParentCategory] =
        useState(null)

    const [deleteCategory, setDeleteCategory] = useState(null)

    // Mengambil seluruh category tree.
    const categoriesQuery = useCategoryTree()

    const createMutation = useCreateCategory()
    const updateMutation = useUpdateCategory()
    const deleteMutation = useDeleteCategory()

    const categories = useMemo(
        () => categoriesQuery.data?.data || [],
        [categoriesQuery.data],
    )

    // Mengambil hanya tiga kategori utama.
    const rootCategories = useMemo(() => {
        return ROOT_CATEGORY_ORDER.map((name) =>
            categories.find(
                (category) =>
                    category.name.toUpperCase() === name &&
                    category.parentId === null,
            ),
        ).filter(Boolean)
    }, [categories])

    // Menentukan jalur navigasi berdasarkan categoryId.
    const categoryPath = useMemo(() => {
        if (!categoryId) return []

        return findCategoryPath(categories, categoryId) || []
    }, [categories, categoryId])

    const activeCategory = categoryPath.at(-1) || null

    // Kategori yang ditampilkan sesuai level aktif.
    const currentCategories = useMemo(() => {
        if (!activeCategory) return []

        return activeCategory.children || []
    }, [activeCategory])

    // Filter pencarian hanya pada kategori di level aktif.
    const filteredCategories = useMemo(() => {
        if (!search) return currentCategories

        return currentCategories.filter((category) =>
            category.name.toLowerCase().includes(search.toLowerCase()),
        )
    }, [currentCategories, search])

    const parentCategories = useMemo(
        () => flattenCategoryTree(categories),
        [categories],
    )

    const isSaving =
        createMutation.isPending || updateMutation.isPending

    const serverErrors =
        createMutation.error?.response?.data?.errors ||
        updateMutation.error?.response?.data?.errors ||
        []

    const normalizedServerErrors = serverErrors.reduce(
        (result, item) => {
            if (item.field) {
                result[item.field] = item.message
            }

            return result
        },
        {},
    )

    // Navigasi ke kategori tertentu.
    const handleOpenCategory = (category) => {
        navigate(`/admin/categories/${category.id}`)
        setSearchInput('')
    }

    // Kembali ke root atau parent tertentu.
    const handleBreadcrumbNavigate = (category) => {
        if (!category) {
            navigate('/admin/categories')
        } else {
            navigate(`/admin/categories/${category.id}`)
        }

        setSearchInput('')
    }

    // Membuka modal tambah dengan parent otomatis.
    const openCreateModal = (parent) => {
        if (!parent || Number(parent.level) >= 3) {
            return
        }

        setFormMode('create')
        setSelectedCategory(null)
        setSelectedParentCategory(parent)
        setFormOpen(true)
    }

    const openEditModal = (category) => {
        const parentCategory = category.parentId
            ? parentCategories.find(
                (item) => String(item.id) === String(category.parentId)
            ) || null
            : null

        setFormMode('edit')
        setSelectedCategory(category)
        setSelectedParentCategory(parentCategory)
        setFormOpen(true)
    }

    const closeFormModal = () => {
        if (isSaving) return

        setFormOpen(false)
        setSelectedCategory(null)
        setSelectedParentCategory(null)
    }

    // Simpan kategori.
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

                toast.success('Category updated successfully')
            } else {
                await createMutation.mutateAsync(payload)

                toast.success('Category created successfully')
            }

            closeFormModal()
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Failed to save category',
            )
        }
    }

    // Hapus kategori.
    const handleDelete = async () => {
        if (!deleteCategory) return

        try {
            await deleteMutation.mutateAsync(deleteCategory.id)

            toast.success('Category deleted successfully')
            setDeleteCategory(null)
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Failed to delete category',
            )
        }
    }

    // Judul halaman berdasarkan level.
    const pageTitle = !activeCategory
        ? 'Question Categories'
        : activeCategory.level === 1
            ? `${activeCategory.name} Categories`
            : activeCategory.level === 2
                ? `${activeCategory.name} Chapters`
                : activeCategory.name

    const pageDescription = !activeCategory
        ? 'Manage your question categories and learning materials.'
        : activeCategory.level === 1
            ? `Manage subcategories under ${activeCategory.name}.`
            : activeCategory.level === 2
                ? `Manage chapters under ${activeCategory.name}.`
                : 'Manage category information.'

    // State loading.
    if (categoriesQuery.isLoading) {
        return <LoadingSpinner text="Loading categories..." />
    }

    // State error.
    if (categoriesQuery.isError) {
        return (
            <ErrorState
                message={
                    categoriesQuery.error?.response?.data?.message ||
                    'Failed to load categories.'
                }
                onRetry={() => categoriesQuery.refetch()}
            />
        )
    }

    // Kategori tidak ditemukan.
    if (categoryId && !activeCategory) {
        return (
            <div className="space-y-6">
                <Button
                    variant="soft"
                    onClick={() => navigate('/admin/categories')}
                >
                    Back to Categories
                </Button>

                <EmptyState
                    title="Category not found"
                    description="The selected category does not exist."
                />
            </div>
        )
    }

    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <CategoryBreadcrumb
                items={categoryPath}
                onNavigate={handleBreadcrumbNavigate}
            />

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {pageTitle}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        {pageDescription}
                    </p>
                </div>

                {/* Tombol tambah hanya pada level 1 dan 2 */}
                {activeCategory &&
                    Number(activeCategory.level) < 3 && (
                        <Button
                            onClick={() =>
                                openCreateModal(activeCategory)
                            }
                        >
                            <Plus size={18} />

                            {Number(activeCategory.level) === 1
                                ? 'Add Subcategory'
                                : 'Add Chapter'}
                        </Button>
                    )}
            </div>

            {/* Root Overview */}
            {!activeCategory ? (
                <CategoryOverview
                    categories={rootCategories}
                    onOpen={handleOpenCategory}
                />
            ) : (
                <>
                    {/* Search */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="relative max-w-md">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <Input
                                type="search"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                placeholder="Search categories..."
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Category List */}
                    {filteredCategories.length === 0 ? (
                        <EmptyState
                            title={
                                search
                                    ? 'No categories found'
                                    : Number(activeCategory.level) === 2
                                        ? 'No chapters yet'
                                        : 'No subcategories yet'
                            }
                            description={
                                search
                                    ? 'No categories match your search.'
                                    : Number(activeCategory.level) === 2
                                        ? 'This subcategory does not have any chapters yet. Create your first chapter to get started.'
                                        : 'This category does not have any subcategories yet.'
                            }
                        />
                    ) : (
                        <CategoryLevelList
                            categories={filteredCategories}
                            currentLevel={Number(activeCategory.level) + 1}
                            onOpen={handleOpenCategory}
                            onAddChild={openCreateModal}
                            onEdit={openEditModal}
                            onDelete={setDeleteCategory}
                        />
                    )}
                </>
            )}

            {/* Category Form */}
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

            {/* Delete Dialog */}
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
