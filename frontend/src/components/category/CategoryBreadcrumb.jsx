
import { ChevronRight, Home } from 'lucide-react'

function CategoryBreadcrumb({ items, onNavigate }) {
    return (
        <nav className="flex flex-wrap items-center gap-2 text-sm">
            <button
                type="button"
                onClick={() => onNavigate(null)}
                className="flex cursor-pointer items-center gap-1.5 text-gray-500 transition hover:text-blue-600"
            >
                <Home size={15} />
                Categories
            </button>

            {items.map((item, index) => {
                const isLast = index === items.length - 1

                return (
                    <div
                        key={item.id}
                        className="flex items-center gap-2"
                    >
                        <ChevronRight
                            size={15}
                            className="text-gray-400"
                        />

                        <button
                            type="button"
                            disabled={isLast}
                            onClick={() => onNavigate(item)}
                            className={`${
                                isLast
                                    ? 'cursor-default font-semibold text-gray-900'
                                    : 'cursor-pointer text-gray-500 hover:text-blue-600'
                            }`}
                        >
                            {item.name}
                        </button>
                    </div>
                )
            })}
        </nav>
    )
}

export default CategoryBreadcrumb
