import {
    ChevronDown,
    ChevronRight,
    Edit,
    MoreVertical,
    Plus,
    Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'

function CategoryTreeItem({
    category,
    level,
    search,
    onEdit,
    onDelete,
    onAddChild,
}) {
    const [isExpanded, setIsExpanded] = useState(
        Boolean(search?.trim()),
    )
    useEffect(() => {
        if (search?.trim()) {
            setIsExpanded(true)
        }
    }, [search])

    const [isActionOpen, setIsActionOpen] = useState(false)

    const hasChildren = category.children?.length > 0

    const handleToggle = () => {
        if (!hasChildren) {
            return
        }

        setIsExpanded((current) => !current)
    }

    const handleAction = (callback) => {
        setIsActionOpen(false)

        if (callback) {
            callback(category)
        }
    }

    return (
        <div>
            <div
                className="group flex items-center gap-2 px-5 py-3 hover:bg-gray-50"
                style={{
                    paddingLeft: `${20 + level * 28}px`,
                }}
            >
                {/* Expand / Collapse */}
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={!hasChildren}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${hasChildren
                        ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
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

                {/* Category name */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-gray-900">
                            {category.name}
                        </span>

                        <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${category.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            {category.is_active
                                ? 'Active'
                                : 'Inactive'}
                        </span>
                    </div>

                    {category.description && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() =>
                            setIsActionOpen((current) => !current)
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        aria-label={`Actions for ${category.name}`}
                        title="Actions"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {isActionOpen && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                            <button
                                type="button"
                                onClick={() =>
                                    handleAction(onAddChild)
                                }
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Plus size={16} />
                                Add Child
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleAction(onEdit)
                                }
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Edit size={16} />
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleAction(onDelete)
                                }
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Recursive children */}
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