
import SubscriptionCard from '../components/subscription/SubscriptionCard'
import { useNavigate } from 'react-router-dom'
import {
    useSubscription,
    useSubscriptionCatalog,
} from '../hooks/useSubscription'
import { useState, useEffect, useRef } from 'react'
import {
    useCreateSubscriptionCheckout,
    usePaymentDetail,
} from '../hooks/usePayment'
import { openDokuCheckout, closeDokuCheckout } from '../utils/doku-checkout'
import { useAuthStore } from '../../stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { formatSubscriptionDate as formatDate } from '../utils/subscription-date'

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
    const navigate = useNavigate()
    const redirectedPaymentRef = useRef(null)
    const checkoutMutation = useCreateSubscriptionCheckout()
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
        return () => { mounted.current = false; closeDokuCheckout() }
    }, [])


    const queryClient = useQueryClient()

    const payment = paymentQuery.data?.data

    useEffect(() => {
        if (!paymentId || !payment?.appliedAt) return
        if (redirectedPaymentRef.current === paymentId) return

        const auth = useAuthStore.getState()
        if (!mounted.current || !userId) return
        if (String(auth.user?.id) !== String(userId)) return
        redirectedPaymentRef.current = paymentId

        if (paymentStorageKey) {
            try {
                sessionStorage.removeItem(paymentStorageKey)
            } catch {
                // Kegagalan storage tidak mengubah status payment.
            }
        }
        closeDokuCheckout()
        queryClient.invalidateQueries({
            queryKey: ['subscription-catalog'],
        })
        navigate(
            `/user/payment/success?paymentId=${encodeURIComponent(paymentId)}`,
            { replace: true }
        )
    }, [
        paymentId,
        payment?.appliedAt,
        paymentStorageKey,
        userId,
        navigate,
        queryClient,
    ])

    const handleCheckout = async (tier) => {
        if (!tier?.isPurchasable || !tier?.id) return
        if (!userId || checkoutInFlight.current) return
        checkoutInFlight.current = true
        closeDokuCheckout()
        const sessionId = useAuthStore.getState().sessionId
        const isCurrentSession = () => mounted.current &&
            useAuthStore.getState().user?.id === userId &&
            useAuthStore.getState().sessionId === sessionId
        setIsOpeningCheckout(true)
        setCheckoutError(null)
        setStorageWarning(null)

        try {
            const response = await checkoutMutation.mutateAsync(
                String(tier.id)
            )
            if (!isCurrentSession()) return

            const payment = response?.data
            if (!/^[1-9]\d*$/.test(String(payment?.id ?? ''))) {
                throw new Error('Payment response is invalid')
            }

            setPaymentId(String(payment.id))
            queryClient.setQueryData(['user-payment', userId, String(payment.id)], response)
            try {
                sessionStorage.setItem(paymentStorageKey, String(payment.id))
            } catch {
                setStorageWarning(
                    'Transaksi tercatat, tetapi browser tidak dapat menyimpan ID pembayaran. Tetap buka halaman ini untuk memantau status.'
                )
            }

            if (payment.appliedAt) {
                setCheckoutError(
                    'Subscription sudah berhasil diaktifkan. Mengarahkan ke halaman konfirmasi.'
                )
                return
            }

            if (payment.status === 'paid') {
                setCheckoutError(
                    payment.applicationReviewStatus === 'needs_review'
                        ? 'Pembayaran diterima, tetapi aktivasi subscription memerlukan pemeriksaan.'
                        : 'Pembayaran diterima. Aktivasi subscription sedang diproses.'
                )
                return
            }

            if (payment.status !== 'pending' || !payment.paymentUrl) {
                setCheckoutError(
                    'Transaksi sedang diproses. Halaman pembayaran belum tersedia.'
                )
                return
            }

            await openDokuCheckout(payment.paymentUrl, isCurrentSession, () => {
                queryClient.invalidateQueries({ queryKey: ['user-payment', userId, String(payment.id)] })
            })
        } catch (error) {
            if (!isCurrentSession()) return
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

    const hasActivePaidSubscription =
        subscription?.status === 'active' &&
        subscription?.tier?.slug !== 'free' &&
        Boolean(subscription?.tier)

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

                {hasActivePaidSubscription ? (
                    <div className="mt-3 space-y-2 text-sm">
                        <p className="font-medium text-blue-600">
                            {subscription.tier.name} Aktif
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
                            isCurrentPlan={
                                hasActivePaidSubscription
                                    ? String(subscription.tier.id) ===
                                    String(tier.id)
                                    : tier.slug === 'free'
                            }
                            purchaseAction={tier.purchaseAction}
                            isPurchasable={tier.isPurchasable}
                            purchaseBlockReason={tier.purchaseBlockReason}
                            onCheckout={() => handleCheckout(tier)}
                            isCheckoutLoading={
                                checkoutMutation.isPending ||
                                isOpeningCheckout
                            }
                        />
                    ))}
                </div>
            )}

            {storageWarning && (
                <p role="alert" className="mt-6 text-sm text-amber-800">
                    {storageWarning}
                </p>
            )}

            {payment?.status === 'paid' &&
                !payment?.appliedAt &&
                payment?.applicationReviewStatus === 'needs_review' && (
                    <div
                        role="alert"
                        className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
                    >
                        <p className="text-sm font-semibold text-amber-900">
                            Pembayaran diterima, aktivasi perlu pemeriksaan
                        </p>

                        <p className="mt-2 text-sm text-amber-800">
                            Pembayaran kamu sudah diterima, tetapi subscription
                            belum dapat diaktifkan secara otomatis.
                            Simpan nomor transaksi dan hubungi administrator
                            untuk pemeriksaan lebih lanjut.
                        </p>

                        <p className="mt-2 text-xs text-amber-800">
                            ID Pembayaran: {paymentId}
                        </p>
                    </div>
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


        </div>
    )
}

export default SubscriptionPage
