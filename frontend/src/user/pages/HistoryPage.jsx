
import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  History,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'

import HistoryCard from '../components/history/HistoryCard'
import { useAttemptHistory } from '../hooks/useAttemptHistory'

const PAGE_LIMIT = 10

function HistoryPage() {
  const [page, setPage] = useState(1)

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useAttemptHistory({
    page,
    limit: PAGE_LIMIT,
  })

  const items = data?.items ?? []

  const pagination = data?.pagination

  const totalPages = pagination?.totalPages ?? 0

  const hasNextPage =
    pagination?.hasNextPage ?? false

  const hasPreviousPage =
    pagination?.hasPreviousPage ?? false

  const handlePreviousPage = () => {
    if (!hasPreviousPage || isFetching) return

    setPage((current) => Math.max(1, current - 1))
  }

  const handleNextPage = () => {
    if (!hasNextPage || isFetching) return

    setPage((current) => current + 1)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
          <History size={18} aria-hidden="true" />
          Riwayat Pengerjaan
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          History Tryout
        </h1>

        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Lihat kembali hasil simulasi CAT CPNS yang
          telah kamu selesaikan.
        </p>
      </div>

      {/* Initial loading */}
      {isPending && (
        <div
          role="status"
          className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white"
        >
          <LoaderCircle
            size={28}
            className="animate-spin text-slate-500"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-500">
            Memuat riwayat tryout...
          </p>
        </div>
      )}

      {/* Error */}
      {!isPending && isError && (
        <div
          role="alert"
          className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <AlertCircle
            size={32}
            className="text-red-600"
            aria-hidden="true"
          />

          <h2 className="mt-3 font-semibold text-red-800">
            Gagal memuat riwayat
          </h2>

          <p className="mt-2 max-w-md text-sm text-red-700">
            Data riwayat belum berhasil diambil.
            Silakan coba kembali.
          </p>

          {import.meta.env.DEV && error && (
            <p className="mt-2 max-w-lg break-words text-xs text-red-600">
              {error.message}
            </p>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isPending && !isError && items.length === 0 && (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <ClipboardList
              size={26}
              className="text-slate-500"
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {page === 1
              ? 'Belum ada riwayat tryout'
              : 'Tidak ada data di halaman ini'}
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            {page === 1
              ? 'Riwayat akan muncul setelah kamu menyelesaikan tryout.'
              : 'Halaman ini tidak memiliki riwayat. Kembali ke halaman sebelumnya.'}
          </p>

          {page > 1 && (
            <button
              type="button"
              onClick={() => setPage(1)}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Kembali ke Halaman Pertama
            </button>
          )}
        </div>
      )}

      {/* History list */}
      {!isPending && !isError && items.length > 0 && (
        <div className="space-y-4">
          {items.map((history) => (
            <HistoryCard
              key={history.attemptId}
              history={history}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isPending &&
        !isError &&
        totalPages > 1 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Halaman{' '}
              <span className="font-semibold text-slate-900">
                {pagination.page}
              </span>{' '}
              dari{' '}
              <span className="font-semibold text-slate-900">
                {totalPages}
              </span>
              {' · '}
              {pagination.totalItems} riwayat
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage || isFetching}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft
                  size={16}
                  aria-hidden="true"
                />
                Sebelumnya
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={!hasNextPage || isFetching}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Berikutnya
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        )}

      {/* Status ketika mengambil data terbaru */}
      {!isPending && isFetching && !isError && (
        <p
          role="status"
          className="text-center text-xs text-slate-500"
        >
          Memperbarui data riwayat...
        </p>
      )}
    </div>
  )
}

export default HistoryPage
