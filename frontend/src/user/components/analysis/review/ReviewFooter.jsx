import { Link } from 'react-router-dom'

const buttonBase =
  'focus-ring inline-flex h-12 items-center justify-center rounded-xl px-4 text-[14px] font-semibold transition-colors lg:px-5'

function ReviewFooter({ index, total, resultUrl, onPrevious, onNext }) {
  const isFirst = index === 0
  const isLast = index >= total - 1

  return (
    <footer className="sticky bottom-0 z-20 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          className={`${buttonBase} border border-border bg-card text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Sebelumnya
        </button>

        <p aria-live="polite" className="text-center text-[13px] text-muted-foreground">
          {total ? index + 1 : 0} / {total} soal
        </p>

        {isLast && resultUrl ? (
          <Link
            to={resultUrl}
            className={`${buttonBase} bg-primary-700 text-white hover:bg-primary-700/90`}
          >
            Kembali ke Hasil
          </Link>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isLast}
            className={`${buttonBase} bg-primary-700 text-white hover:bg-primary-700/90 disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Selanjutnya
          </button>
        )}
      </div>
    </footer>
  )
}

export default ReviewFooter