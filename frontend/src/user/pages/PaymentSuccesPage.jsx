
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Crown,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'

import { usePaymentDetail } from '../hooks/usePayment'
import { useSubscription } from '../hooks/useSubscription'
import { formatSubscriptionDate } from '../utils/subscription-date'

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-'

  const amount = Number(value)
  if (!Number.isFinite(amount)) return '-'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const FAILED_STATUSES = [
  'failed',
  'expired',
  'cancelled',
  'canceled',
]

function PaymentSuccessPage() {
  const userId = useAuthStore((state) => state.user?.id)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const rawPaymentId = searchParams.get('paymentId')
  const paymentId = /^[1-9]\d*$/.test(rawPaymentId ?? '')
    ? rawPaymentId
    : null

  const paymentQuery = usePaymentDetail(paymentId)
  const subscriptionQuery = useSubscription()

  const payment = paymentQuery.data?.data ?? null
  const subscription = subscriptionQuery.data?.data ?? null

  const paymentStatus = String(
    payment?.status ?? ''
  ).toLowerCase()

  const isPaymentApplied = Boolean(payment?.appliedAt)
  const isPaymentFailed = FAILED_STATUSES.includes(paymentStatus)

  const isSubscriptionActive =
    subscription?.status === 'active' &&
    subscription?.tier?.slug === 'premium'

  // Aktivasi bisa selesai setelah pengguna tiba di halaman konfirmasi.
  useEffect(() => {
    if (!userId || !paymentId || !isPaymentApplied) return

    for (const queryKey of [
      ['user-subscription', userId],
      ['user-subscription-catalog'],
      ['user-tryouts', userId],
      ['user-tryout-detail', userId],
    ]) {
      void queryClient.invalidateQueries({ queryKey })
    }
  }, [userId, paymentId, isPaymentApplied, queryClient])

  const { refetch: refetchSubscription } = subscriptionQuery

  // Ulangi sinkronisasi jika request subscription belum mendapat data aktif.
  useEffect(() => {
    if (!userId || !isPaymentApplied || isSubscriptionActive) return

    const timer = setInterval(() => {
      void refetchSubscription({ cancelRefetch: false })
    }, 3000)

    return () => clearInterval(timer)
  }, [userId, isPaymentApplied, isSubscriptionActive, refetchSubscription])

  const isSuccess =
    isPaymentApplied && isSubscriptionActive

  const isActivating =
    paymentStatus === 'paid' && !isPaymentApplied

  const isLoading =
    Boolean(paymentId) &&
    (
      paymentQuery.isPending ||
      (isPaymentApplied && subscriptionQuery.isPending)
    )

  const isError =
    !paymentId ||
    paymentQuery.isError ||
    (isPaymentApplied && subscriptionQuery.isError)

  let pageState = 'pending'

  if (isError) {
    pageState = 'error'
  } else if (isPaymentFailed && !isPaymentApplied) {
    pageState = 'failed'
  } else if (isSuccess) {
    pageState = 'success'
  } else if (isPaymentApplied || isActivating) {
    pageState = 'activating'
  }

  const handleRefresh = async () => {
    await Promise.all([
      paymentQuery.refetch(),
      subscriptionQuery.refetch(),
    ])
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center gap-4">
        <LoaderCircle className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm text-slate-600">
          Memverifikasi pembayaran dan subscription...
        </p>
      </div>
    )
  }

  const isPending =
    pageState === 'pending' ||
    pageState === 'activating'

  const tierName =
    subscription?.tier?.name ??
    'Premium'

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Payment status */}
        <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div
            className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${
              isSuccess
                ? 'bg-green-50'
                : isPending
                  ? 'bg-amber-50'
                  : 'bg-red-50'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            ) : isPending ? (
              <Clock3 className="h-12 w-12 text-amber-500" />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            {pageState === 'success'
              ? 'Pembayaran Berhasil!'
              : pageState === 'activating'
                ? 'Pembayaran Berhasil, Mengaktifkan Premium'
                : pageState === 'pending'
                  ? 'Menunggu Konfirmasi Pembayaran'
                  : pageState === 'failed'
                    ? 'Pembayaran Tidak Berhasil'
                    : 'Verifikasi Belum Tersedia'}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {pageState === 'success'
              ? 'Subscription kamu sudah aktif. Selamat menikmati fitur premium!'
              : pageState === 'activating'
                ? 'Pembayaran kamu sudah diterima. Kami sedang menyiapkan akses Premium. Status akan diperbarui otomatis; kamu tidak perlu membayar lagi.'
                : pageState === 'pending'
                  ? 'Kami belum menerima konfirmasi akhir dari sistem pembayaran.'
                  : pageState === 'failed'
                    ? 'Transaksi tidak berhasil diselesaikan.'
                    : 'Status transaksi belum dapat diverifikasi. Silakan periksa kembali.'}
          </p>
        </section>

        {/* Active subscription */}
        {isSuccess && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Paket Aktif
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Aktif
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-4">
                <Crown className="h-7 w-7 text-blue-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {tierName}
                </h2>
                <p className="text-sm text-slate-500">
                  Subscription berhasil diaktifkan
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs text-slate-500">
                  Tanggal Aktivasi
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatSubscriptionDate(subscription?.startedAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Berlaku Hingga
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatSubscriptionDate(subscription?.expiredAt)}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Payment details */}
        {payment && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-semibold text-slate-900">
              Detail Pembayaran
            </h2>

            <div className="space-y-4 text-sm">
              {[
                ['ID Pembayaran', payment.id],
                [
                  'Nomor Transaksi',
                  payment.invoiceNumber ?? payment.invoice_number,
                ],
                [
                  'Metode Pembayaran',
                  payment.paymentMethod ?? payment.payment_method,
                ],
                ['Total Pembayaran', formatCurrency(payment.amount)],
                ['Status', paymentStatus || '-'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4"
                >
                  <span className="text-slate-500">
                    {label}
                  </span>

                  <span className="break-all text-right font-medium text-slate-900">
                    {value ?? '-'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isSuccess ? (
            <button
              type="button"
              onClick={() => navigate('/user/tryouts')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Mulai Kerjakan Tryout
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={
                !paymentId ||
                paymentQuery.isFetching ||
                subscriptionQuery.isFetching
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  paymentQuery.isFetching ||
                  subscriptionQuery.isFetching
                    ? 'animate-spin'
                    : ''
                }
              />
              Periksa Status Lagi
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/user/dashboard')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LayoutDashboard size={18} />
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </main>
  )
}

export default PaymentSuccessPage
