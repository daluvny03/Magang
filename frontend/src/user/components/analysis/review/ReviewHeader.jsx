import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function ReviewHeader({ title, resultUrl }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-3 py-2 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-primary-700">
            Pembahasan Soal
          </p>

          <h1 className="truncate text-[15px] font-bold text-foreground lg:text-[17px]">
            {title}
          </h1>
        </div>

        <Link
          to={resultUrl}
          className="focus-ring inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary-50 px-4 text-[14px] font-semibold text-primary-700 transition-colors hover:bg-primary-100"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Hasil Tryout
        </Link>
      </div>
    </header>
  )
}

export default ReviewHeader