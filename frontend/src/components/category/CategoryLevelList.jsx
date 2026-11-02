
import { FolderTree, Edit, Trash2, Plus } from 'lucide-react'
import Badge from '../ui/Badge'
import IconButton from '../ui/IconButton'

function CategoryLevelList({
    categories,
    onOpen,
    onAddChild,
    onEdit,
    onDelete,
    currentLevel,
}) {
    if (!categories.length) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <FolderTree
                    size={32}
                    className="mx-auto text-gray-400"
                />

                <h3 className="mt-3 font-semibold text-gray-900">
                    No categories yet
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Create a category to organize your questions.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
                const hasChildren = category.children?.length > 0

                // Level 1 -> bisa membuka subkategori
                // Level 2 -> bisa membuka chapter
                const canOpen = Number(currentLevel) < 3

                return (
                    <div
                        key={category.id}
                        onClick={() => {
                            if (canOpen) onOpen(category)
                        }}
                        role={canOpen ? 'button' : undefined}
                        tabIndex={canOpen ? 0 : undefined}
                        onKeyDown={(event) => {
                            if (
                                canOpen &&
                                (event.key === 'Enter' || event.key === ' ')
                            ) {
                                event.preventDefault()
                                onOpen(category)
                            }
                        }}
                        className={`rounded-xl border border-gray-100 bg-white p-4 shadow-card transition hover:border-primary-200 ${canOpen ? 'cursor-pointer' : 'cursor-default'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                                <FolderTree size={20} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {category.name}
                                </p>

                                <div className="mt-1">
                                    <Badge
                                        tone={category.is_active ? 'green' : 'gray'}
                                    >
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div
                                className="flex shrink-0 items-center"
                                onClick={(event) => event.stopPropagation()}
                            >
                                {Number(currentLevel) < 3 && (
                                    <IconButton
                                        label="Add child category"
                                        onClick={() => onAddChild(category)}
                                        className="text-primary-600 hover:bg-primary-100"
                                    >
                                        <Plus size={17} />
                                    </IconButton>
                                )}

                                <IconButton
                                    label="Edit category"
                                    onClick={() => onEdit(category)}
                                >
                                    <Edit size={17} />
                                </IconButton>

                                <IconButton
                                    label="Delete category"
                                    onClick={() => onDelete(category)}
                                    className="hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 size={17} />
                                </IconButton>
                            </div>
                        </div>

                        <p className="mt-3 line-clamp-2 min-h-8 text-xs text-gray-500">
                            {category.description || 'Tidak ada deskripsi.'}
                        </p>

                        <div className="mt-3 border-t border-gray-100 pt-3">
                            <span className="text-xs text-gray-500">
                                {hasChildren
                                    ? `${category.children.length} ${Number(currentLevel) === 2
                                        ? 'chapter'
                                        : 'subkategori'
                                    }`
                                    : Number(currentLevel) === 2
                                        ? 'Belum ada chapter'
                                        : 'Belum ada subkategori'}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default CategoryLevelList
