import { ArrowLeft, ArrowRight } from 'lucide-react'
import Surface from '@/user/components/common/Surface'

const navButton =
    'focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'
// 1, halaman sekitar yang aktif, dan terakhir; celah diganti elipsis
const getPageItems = (page, totalPages) => {
    const wanted = new Set([1, totalPages, page - 1, page, page + 1])
    const pages = [...wanted]
        .filter((number) => number >= 1 && number <= totalPages)
        .sort((a, b) => a - b)
    const items = []
    pages.forEach((number, index) => {
        const previous = pages[index - 1]
        if (previous !== undefined) {
            if (number - previous === 2) items.push(previous + 1)
            else if (number - previous > 2) items.push(`gap-${number}`)
        }
        items.push(number)
    })
    return items
}

function PaginationNav({ page, totalPages, onPageChange, label = 'Halaman' }) {
    if (totalPages <= 1) return null
    const items = getPageItems(page, totalPages)
    return (
        <Surface
            as="nav"
            aria-label={label}
            className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:px-5"
        >
            <p aria-live="polite" className="text-[14px] text-muted-foreground">
                Halaman <strong className="text-foreground">{page}</strong> dari{' '}
                <strong className="text-foreground">{totalPages}</strong>
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className={navButton}
                >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Sebelumnya
                </button>

                <ul className="hidden items-center gap-1.5 sm:flex">
                    {items.map((item) =>
                        typeof item === 'number' ? (
                            <li key={item}>
                                <button
                                    type="button"
                                    onClick={() => onPageChange(item)}
                                    aria-label={`Halaman ${item}`}
                                    aria-current={item === page ? 'page' : undefined}
                                    className={`focus-ring h-11 min-w-11 rounded-xl border px-3 text-[14px] font-semibold transition-colors ${item === page
                                            ? 'border-primary-700 bg-primary-700 text-white'
                                            : 'border-border bg-card text-foreground hover:bg-muted'
                                        }`}
                                >
                                    {item}
                                </button>
                            </li>
                        ) : (
                            <li
                                key={item}
                                aria-hidden="true"
                                className="px-1 text-muted-foreground"
                            >
                                …
                            </li>
                        )
                    )}
                </ul>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className={navButton}
                >
                    Berikutnya
                    <ArrowRight size={16} aria-hidden="true" />
                </button>
            </div>
        </Surface>
    )
}

export default PaginationNav