import { createPortal } from 'react-dom'
import { LogOut } from 'lucide-react'

import { useModalFocus } from '@/hooks/useModalFocus'

function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const dialogRef = useModalFocus(onClose, false, isOpen)

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 font-user">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        aria-describedby="logout-confirm-description"
        className="w-full max-w-md rounded-2xl bg-card p-6 text-foreground shadow-xl"
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
          >
            <LogOut size={20} />
          </span>

          <div>
            <h2 id="logout-confirm-title" className="text-[17px] font-bold">
              Keluar dari akun?
            </h2>

            <p
              id="logout-confirm-description"
              className="mt-1.5 text-[14px] leading-6 text-muted-foreground"
            >
              Progres latihanmu tetap tersimpan. Kamu perlu masuk kembali untuk
              melanjutkan belajar.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring h-12 rounded-xl border border-border px-5 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="focus-ring h-12 rounded-xl bg-destructive px-5 text-[14px] font-semibold text-white transition-colors hover:bg-destructive/90"
          >
            Ya, logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default LogoutConfirmModal