import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

function CatNavigatorSheet({ open, onClose, title = 'Navigasi Soal', children }) {
    const closeButtonRef = useRef(null)

    useEffect(() => {
        if (!open) return undefined

        const previouslyFocused = document.activeElement
        const previousOverflow = document.body.style.overflow

        document.body.style.overflow = 'hidden'
        closeButtonRef.current?.focus()

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose()
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = previousOverflow
            previouslyFocused?.focus?.()
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <button
                type="button"
                tabIndex={-1}
                aria-label="Tutup navigasi soal"
                onClick={onClose}
                className="absolute inset-0 bg-black/40"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-background p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl"
            >
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-[15px] font-bold text-foreground">
                        {title}
                    </h2>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </div>

                {children}
            </div>
        </div>
    )
}

export default CatNavigatorSheet