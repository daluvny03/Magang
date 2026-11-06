import { LogOut } from 'lucide-react'
import { useModalFocus } from '@/hooks/useModalFocus'

function ExitConfirmModal({ isOpen, isSaving, onClose, onConfirm }) {
  const dialogRef = useModalFocus(onClose, isSaving, isOpen)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cat-exit-title"
        aria-describedby="cat-exit-description"
        className="w-full max-w-md rounded-2xl bg-card p-6 text-foreground shadow-xl"
      >
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800"
          >
            <LogOut size={20} />
          </span>

          <div>
            <h2 id="cat-exit-title" className="text-[17px] font-bold">
              Keluar dari pengerjaan?
            </h2>
            <p
              id="cat-exit-description"
              className="mt-1.5 text-[14px] leading-6 text-muted-foreground"
            >
              Progres jawaban tersimpan. Waktu tryout tetap berjalan dan kamu
              bisa melanjutkan pengerjaan dari halaman Tryout.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="focus-ring h-12 rounded-xl border border-border px-5 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Tetap mengerjakan
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onConfirm}
            className="focus-ring h-12 rounded-xl bg-amber-600 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? 'Menyimpan...' : 'Ya, keluar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExitConfirmModal
