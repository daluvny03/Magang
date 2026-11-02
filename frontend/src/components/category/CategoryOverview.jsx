
import { BookOpen, Brain, Users, ChevronRight } from 'lucide-react'

const CATEGORY_CONFIG = {
    TWK: {
        icon: BookOpen,
        color: 'blue',
        description: 'Tes Wawasan Kebangsaan',
    },
    TIU: {
        icon: Brain,
        color: 'violet',
        description: 'Tes Intelegensia Umum',
    },
    TKP: {
        icon: Users,
        color: 'emerald',
        description: 'Tes Karakteristik Pribadi',
    },
}

function CategoryOverview({ categories, onOpen }) {
    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
                const config = CATEGORY_CONFIG[category.name]
                if (!config) return null
                const Icon = config.icon

                return (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onOpen(category)}
                        className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <div className="flex items-start justify-between">
                            <div
                                className={`rounded-xl p-3 ${
                                    config.color === 'blue'
                                        ? 'bg-blue-50 text-blue-600'
                                        : config.color === 'violet'
                                            ? 'bg-violet-50 text-violet-600'
                                            : 'bg-emerald-50 text-emerald-600'
                                }`}
                            >
                                <Icon size={25} />
                            </div>

                            <ChevronRight
                                size={20}
                                className="text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
                            />
                        </div>

                        <div className="mt-5">
                            <h3 className="text-xl font-bold text-gray-900">
                                {category.name}
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                {config.description}
                            </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                            <span className="text-sm text-gray-500">
                                {category.children?.length || 0} subcategories
                            </span>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

export default CategoryOverview
