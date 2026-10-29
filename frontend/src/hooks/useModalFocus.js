
import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

// Semua pemakai hook berbagi urutan modal, termasuk modal di luar portal.
const openDialogs = []

export const useModalFocus = (onClose, isSubmitting = false, isOpen = true) => {
  const dialogRef = useRef(null)
  const closeRef = useRef(onClose)
  const submittingRef = useRef(isSubmitting)

  useEffect(() => {
    closeRef.current = onClose
    submittingRef.current = isSubmitting
  }, [onClose, isSubmitting])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousElement = document.activeElement
    const dialog = dialogRef.current

    if (!dialog) return undefined

    const token = Symbol('dialog')
    openDialogs.push(token)

    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter((element) =>
        element.getClientRects().length > 0 && element.tabIndex >= 0
      )

    const focusable = getFocusable()

    if (focusable.length > 0) {
      focusable[0].focus()
    } else {
      dialog.focus()
    }

    const handleKeyDown = (event) => {
      if (event.defaultPrevented || openDialogs.at(-1) !== token) return
      if (event.key === 'Escape') {
        if (!submittingRef.current) {
          event.preventDefault()
          closeRef.current?.()
        }
        return
      }

      if (event.key !== 'Tab') return

      const elements = getFocusable()

      if (elements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }

      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const wasTopmost = openDialogs.at(-1) === token
      openDialogs.splice(openDialogs.indexOf(token), 1)

      if (
        wasTopmost &&
        previousElement instanceof HTMLElement &&
        previousElement.isConnected
      ) {
        previousElement.focus()
      }
    }
  }, [isOpen])

  return dialogRef
}
