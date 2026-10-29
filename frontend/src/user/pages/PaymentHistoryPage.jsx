import { useModalFocus } from '../../hooks/useModalFocus'

import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  XCircle,
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { usePaymentHistory } from '../hooks/usePaymentHistory'

const PAGE_LIMIT = 10

const statusConfig = {
  initiating: {
    label: 'Menyiapkan Pembayaran',
    className: 'bg-slate-100 text-slate-700',
  },
  pending: {
    label: 'Menunggu Pembayaran',
    className: 'bg-amber-50 text-amber-700',
  },
  reconciling: {
    label: 'Memverifikasi Pembayaran',
    className: 'bg-blue-50 text-blue-700',
  },
  paid: {
    label: 'Pembayaran Berhasil',
    className: 'bg-green-50 text-green-700',
  },
  expired: {
    label: 'Pembayaran Kedaluwarsa',
    className: 'bg-red-50 text-red-700',
  },
  cancelled: {
    label: 'Pembayaran Dibatalkan',
    className: 'bg-slate-100 text-slate-600',
  },
}

const formatCurrency = (value, currency = 'IDR') => {
  const amount = Number(value)

  if (!Number.isFinite(amount)) return '-'

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return '-'
  }
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(date)
}

const formatDuration = (duration) => {
  if (!duration?.value || !duration?.unit) {
    return '-'
  }

  const units = {
    day: 'Hari',
    month: 'Bulan',
    year: 'Tahun',
  }

  return `${duration.value} ${
    units[duration.unit] ?? duration.unit
  }`
}

function PaymentHistoryPage() {
  const [page, setPage] = useState(1)
  const [selectedPayment, setSelectedPayment] =
    useState(null)
  const dialogRef = useModalFocus(
    () => setSelectedPayment(null),
    false,
    Boolean(selectedPayment)
  )

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = usePaymentHistory({
    page,
    limit: PAGE_LIMIT,
  })

  const items = data?.items ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 0

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <ReceiptText size={18} />
          Subscription
        </div>

        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Riwayat Pembayaran
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Lihat status dan detail transaksi subscription
          yang pernah kamu lakukan.
        </p>
      </header>

      {/* Loading */}
      {isPending && (
        <div
          role="status"
          className="flex min-h-64 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-slate-500"
        >
          <LoaderCircle
            size={24}
            className="animate-spin"
          />
          Memuat riwayat pembayaran...
        </div>
      )}

      {/* Error */}
      {!isPending && isError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
        >
          <AlertCircle
            size={32}
            className="mx-auto text-red-600"
          />

          <h2 className="mt-3 font-semibold text-red-800">
            Gagal memuat pembayaran
          </h2>

          <p className="mt-2 text-sm text-red-700">
            Riwayat pembayaran belum dapat dimuat.
          </p>

          {import.meta.env.DEV && (
            <p className="mt-2 break-words text-xs text-red-600">
              {error?.message}
            </p>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty */}
      {!isPending && !isError && items.length === 0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <CreditCard
            size={36}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Belum ada transaksi
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Riwayat akan tampil setelah kamu
            melakukan checkout subscription.
          </p>

          <Link
            to="/user/subscription"
            className="mt-5 inline-flex rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Lihat Paket Subscription
          </Link>
        </section>
      )}

      {/* List */}
      {!isPending && !isError && items.length > 0 && (
        <section className="space-y-4">
          {items.map((payment) => {
            const status =
              statusConfig[payment.status] ?? {
                label: payment.status,
                className:
                  'bg-slate-100 text-slate-600',
              }

            return (
              <article
                key={payment.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {payment.tierName}
                    </p>

                    <p className="mt-1 break-all text-xs text-slate-500">
                      Invoice: {payment.invoiceNumber}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="mt-4 text-xl font-bold text-slate-900">
                  {formatCurrency(
                    payment.amount,
                    payment.currency
                  )}
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    {formatDate(payment.createdAt)}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPayment(payment)
                    }
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Lihat Detail
                    <ArrowRight size={16} />
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {/* Pagination */}
      {!isPending &&
        !isError &&
        totalPages > 1 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Halaman {pagination.page} dari {totalPages}
              {' · '}
              {pagination.totalItems} transaksi
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage ||
                  isFetching
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Sebelumnya
              </button>

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage ||
                  isFetching
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Berikutnya
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

      {!isPending && isFetching && !isError && (
        <p
          role="status"
          className="text-center text-xs text-slate-500"
        >
          Memperbarui riwayat pembayaran...
        </p>
      )}

      {/* Detail modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-detail-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2
                id="payment-detail-title"
                className="text-lg font-bold text-slate-900"
              >
                Detail Pembayaran
              </h2>

              <button
                type="button"
                aria-label="Tutup detail"
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <XCircle size={21} />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              {[
                [
                  'Paket',
                  selectedPayment.tierName,
                ],
                [
                  'Invoice',
                  selectedPayment.invoiceNumber,
                ],
                [
                  'Nominal',
                  formatCurrency(
                    selectedPayment.amount,
                    selectedPayment.currency
                  ),
                ],
                [
                  'Durasi Paket',
                  formatDuration(
                    selectedPayment.duration
                  ),
                ],
                [
                  'Status',
                  statusConfig[selectedPayment.status]
                    ?.label ?? selectedPayment.status,
                ],
                [
                  'Dibuat',
                  formatDate(selectedPayment.createdAt),
                ],
                [
                  'Batas Pembayaran',
                  formatDate(selectedPayment.expiredAt),
                ],
                [
                  'Dibayar',
                  formatDate(selectedPayment.paidAt),
                ],
                [
                  'Aktivasi Subscription',
                  formatDate(selectedPayment.appliedAt),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:justify-between"
                >
                  <span className="text-slate-500">
                    {label}
                  </span>

                  <span className="break-all font-medium text-slate-900 sm:text-right">
                    {value ?? '-'}
                  </span>
                </div>
              ))}
            </div>

            {selectedPayment.status === 'paid' &&
              !selectedPayment.appliedAt && (
                <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  <Clock3 size={18} className="shrink-0" />
                  Pembayaran berhasil.
                  Aktivasi subscription masih diproses.
                </div>
              )}

            {selectedPayment.status === 'paid' &&
              selectedPayment.appliedAt && (
                <div className="mt-5 flex items-start gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-800">
                  <CheckCircle2
                    size={18}
                    className="shrink-0"
                  />
                  Pembayaran telah diterapkan ke subscription.
                </div>
              )}

            <button
              type="button"
              onClick={() => setSelectedPayment(null)}
              className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentHistoryPage