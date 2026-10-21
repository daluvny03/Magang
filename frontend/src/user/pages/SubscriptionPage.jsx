
import SubscriptionCard from '../components/subscription/SubscriptionCard'
import {
    useSubscription,
    useSubscriptionCatalog,
} from '../hooks/useSubscription'
import { useState, useEffect, useRef } from 'react'
import {
    useCreatePremiumCheckout,
    usePaymentDetail,
} from '../hooks/usePayment'
import { openDokuCheckout } from '../utils/doku-checkout'
import { useAuthStore } from '../../stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { formatSubscriptionDate as formatDate } from '../utils/subscription-date'

const PAYMENT_STATUS_LABELS = {
    initiating: 'Menyiapkan pembayaran',
    reconciling: 'Memeriksa transaksi',
    pending: 'Menunggu pembayaran',
    paid: 'Pembayaran diterima',
    failed: 'Pembayaran gagal',
    expired: 'Pembayaran kedaluwarsa',
    cancelled: 'Pembayaran dibatalkan',
}

const readPaymentId = (key) => {
    if (!key) return null
    try {
        const value = sessionStorage.getItem(key)
        return /^[1-9]\d*$/.test(value ?? '') ? value : null
    } catch {
        return null
    }
}

function SubscriptionPage() {
    const userId = useAuthStore((state) => state.user?.id)
    return <SubscriptionContent key={userId ?? 'anonymous'} userId={userId} />
}

function SubscriptionContent({ userId }) {
    const checkoutMutation = useCreatePremiumCheckout()
    const [checkoutError, setCheckoutError] = useState(null)
    const [storageWarning, setStorageWarning] = useState(null)
    const mounted = useRef(false)
    const checkoutInFlight = useRef(false)
    const [isOpeningCheckout, setIsOpeningCheckout] = useState(false)

    const paymentStorageKey = userId
        ? `cpns:checkout:${userId}`
        : null

    const [paymentId, setPaymentId] = useState(() => readPaymentId(paymentStorageKey))
    const paymentQuery = usePaymentDetail(paymentId)

    useEffect(() => {
        mounted.current = true
        return () => { mounted.current = false }
    }, [])


    const queryClient = useQueryClient()

    const payment = paymentQuery.data?.data

    useEffect(() => {
        if (!paymentId || !payment?.appliedAt) return

        queryClient.invalidateQueries({
            queryKey: ['user-subscription', userId],
        })

        queryClient.invalidateQueries({
            queryKey: ['user-subscription-catalog'],
        })

        queryClient.invalidateQueries({ queryKey: ['user-tryouts', userId] })
        queryClient.invalidateQueries({ queryKey: ['user-tryout-detail', userId] })

        if (paymentStorageKey) {
            try {
                sessionStorage.removeItem(paymentStorageKey)
            } catch {
                // Aktivasi tetap sah walaupun penyimpanan browser tidak tersedia.
            }
        }

        // Release local tracking after verified activation and sessionStorage cleanup.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaymentId(null)
    }, [
        paymentId,
        payment?.appliedAt,
        paymentStorageKey,
        userId,
        queryClient,
    ])

    const handleCheckout = async () => {
        if (!userId || checkoutInFlight.current) return
        checkoutInFlight.current = true
        setIsOpeningCheckout(true)
        setCheckoutError(null)
        setStorageWarning(null)

        try {
            const response = await checkoutMutation.mutateAsync()
            if (!mounted.current || useAuthStore.getState().user?.id !== userId) return

            const payment = response?.data

            if (!/^[1-9]\d*$/.test(String(payment?.id ?? ''))) {
                throw new Error('Payment response is invalid')
            }

            setPaymentId(String(payment.id))
            try {
                sessionStorage.setItem(paymentStorageKey, String(payment.id))
            } catch {
                setStorageWarning(
                    'Transaksi tercatat, tetapi browser tidak dapat menyimpan ID pembayaran. Tetap buka halaman ini untuk memantau status.'
                )
            }

            if (payment.status === 'paid' || payment.appliedAt) {
                setCheckoutError(
                    'Pembayaran sudah tercatat. Silakan periksa status langganan.'
                )
                return
            }

            if (payment.status !== 'pending' || !payment.paymentUrl) {
                setCheckoutError(
                    'Transaksi sedang diproses. Halaman pembayaran belum tersedia.'
                )
                return
            }

            await openDokuCheckout(payment.paymentUrl, () =>
                mounted.current && useAuthStore.getState().user?.id === userId
            )
        } catch (error) {
            if (!mounted.current || useAuthStore.getState().user?.id !== userId) return
            setCheckoutError(
                error?.response?.data?.message ||
                'Tidak dapat membuka halaman pembayaran. Silakan coba kembali.'
            )
        } finally {
            checkoutInFlight.current = false
            if (mounted.current) setIsOpeningCheckout(false)
        }
    }

    const catalogQuery = useSubscriptionCatalog()
    const subscriptionQuery = useSubscription()

    if (
        catalogQuery.isLoading ||
        subscriptionQuery.isLoading
    ) {
        return (
            <div className="p-6 text-gray-500">
                Memuat informasi langganan...
            </div>
        )
    }

    if (
        catalogQuery.isError ||
        subscriptionQuery.isError
    ) {
        return (
            <div className="p-6 text-red-600">
                Gagal memuat informasi langganan.
            </div>
        )
    }

    const tiers = catalogQuery.data?.data ?? []
    const subscription = subscriptionQuery.data?.data ?? null

    const hasActivePremium =
        subscription?.status === 'active' &&
        subscription?.tier?.slug === 'premium'

    return (
        <div className="mx-auto max-w-5xl p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">
                    Paket Langganan
                </h1>
                <p className="mt-2 text-gray-500">
                    Pilih paket untuk mengakses latihan CAT CPNS.
                </p>
            </div>

            <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="font-semibold">
                    Langganan Saya
                </h2>

                {hasActivePremium ? (
                    <div className="mt-3 space-y-2 text-sm">
                        <p className="font-medium text-blue-600">
                            Premium Aktif
                        </p>
                        <p>
                            Tanggal aktivasi:{' '}
                            {formatDate(subscription.startedAt)}
                        </p>
                        <p>
                            Berlaku sampai:{' '}
                            {formatDate(subscription.expiredAt)}
                        </p>
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-gray-600">
                        Anda sedang menggunakan paket Free.
                    </p>
                )}
            </div>

            {tiers.length === 0 ? (
                <p className="text-gray-500">
                    Paket langganan belum tersedia.
                </p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {tiers.map((tier) => (
                        <SubscriptionCard
                            key={tier.id}
                            tier={tier}
                            hasActivePremium={hasActivePremium}
                            isCurrentPlan={
                                hasActivePremium
                                    ? tier.slug === 'premium'
                                    : tier.slug === 'free'
                            }

                            onCheckout={tier.slug === 'premium' ? handleCheckout : undefined}
                            isCheckoutLoading={checkoutMutation.isPending || isOpeningCheckout}

                        />
                    ))}
                </div>
            )}

            {storageWarning && (
                <p role="alert" className="mt-6 text-sm text-amber-800">
                    {storageWarning}
                </p>
            )}

            {checkoutError && (
                <div
                    role="alert"
                    className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
                >
                    {checkoutError}
                </div>
            )}

            {checkoutMutation.isError && (
                <p
                    role="alert"
                    className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    Gagal menyiapkan transaksi pembayaran.
                </p>
            )}

            {paymentId && (
                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
                    <h2 className="font-semibold">
                        Status Pembayaran
                    </h2>

                    {paymentQuery.isLoading ? (
                        <p className="mt-2 text-sm text-gray-500">
                            Memuat informasi pembayaran...
                        </p>
                    ) : paymentQuery.isError ? (
                        <p className="mt-2 text-sm text-red-600">
                            Gagal mengambil status pembayaran.
                        </p>
                    ) : paymentQuery.data?.data ? (
                        <div className="mt-3 space-y-2 text-sm">
                            <p>
                                Invoice:{' '}
                                {paymentQuery.data.data.invoiceNumber}
                            </p>

                            <p>
                                Status:{' '}
                                {PAYMENT_STATUS_LABELS[paymentQuery.data.data.status] ??
                                    'Status tidak diketahui'}
                            </p>

                            {['initiating', 'pending', 'reconciling'].includes(
                                paymentQuery.data.data.status
                            ) && (
                                    <p className="text-amber-700">
                                        Transaksi sedang diproses.
                                        Pembayaran belum dikonfirmasi.
                                    </p>
                                )}

                            {paymentQuery.data.data.status === 'paid' && (
                                <p className="text-blue-700">
                                    Pembayaran tercatat berhasil.
                                    Aktivasi Premium sedang dikonfirmasi.
                                </p>
                            )}

                            {paymentQuery.data.data.appliedAt && (
                                <p className="text-green-700">
                                    Pembayaran telah diterapkan ke subscription.
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => paymentQuery.refetch()}
                                disabled={paymentQuery.isFetching}
                                className="mt-3 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {paymentQuery.isFetching
                                    ? 'Memeriksa...'
                                    : 'Periksa Status'}
                            </button>

                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}

export default SubscriptionPage
