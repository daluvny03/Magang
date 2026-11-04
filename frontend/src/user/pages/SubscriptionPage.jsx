import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Crown, RefreshCw } from 'lucide-react'

import EmptyState from '@/user/components/common/EmptyState'
import PageHeader from '@/user/components/common/PageHeader'
import Surface from '@/user/components/common/Surface'
import { Skeleton } from '@/user/components/common/Skeletons'
import { buttonClass } from '@/user/components/common/buttonStyles'

import SubscriptionCard from '../components/subscription/SubscriptionCard'
import CurrentSubscriptionCard from '../components/subscription/CurrentSubscriptionCard'
import CheckoutNotices from '../components/subscription/CheckoutNotices'
import {
    useSubscription,
    useSubscriptionCatalog,
} from '../hooks/useSubscription'
import {
    useCreateSubscriptionCheckout,
    usePaymentDetail,
} from '../hooks/usePayment'
import { openDokuCheckout, closeDokuCheckout } from '../utils/doku-checkout'
import { useAuthStore } from '../../stores/authStore'

const readPaymentId = (key) => {
    if (!key) return null
    try {
        const value = sessionStorage.getItem(key)
        return /^[1-9]\d*$/.test(value ?? '') ? value : null
    } catch {
        return null
    }
}

function SubscriptionSkeleton() {
    return (
        <div role="status" className="mx-auto w-full max-w-6xl space-y-8">
            <Skeleton className="h-16 w-80" />
            <Skeleton className="h-32 w-full rounded-2xl" />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <Surface key={item} className="space-y-4 p-6">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-9 w-40" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </Surface>
                ))}
            </div>

            <span className="sr-only">Memuat informasi langganan...</span>
        </div>
    )
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
            queryKey: ['user-subscription-catalog', userId],
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

    if (catalogQuery.isLoading || subscriptionQuery.isLoading) {
        return <SubscriptionSkeleton />
    }

    if (catalogQuery.isError || subscriptionQuery.isError) {
        return (
            <EmptyState
                icon={AlertCircle}
                title="Informasi Langganan Tidak Tersedia"
                description="Gagal memuat informasi langganan."
                action={
                    <button
                        type="button"
                        onClick={() => {
                            catalogQuery.refetch()
                            subscriptionQuery.refetch()
                        }}
                        className={buttonClass.solid}
                    >
                        <RefreshCw size={16} aria-hidden="true" />
                        Coba Lagi
                    </button>
                }
            />
        )
    }

    const tiers = catalogQuery.data?.data ?? []
    const subscription = subscriptionQuery.data?.data ?? null

    const hasActivePaidSubscription =
        subscription?.status === 'active' &&
        subscription?.tier?.slug !== 'free' &&
        Boolean(subscription?.tier)

    const needsReview =
        payment?.status === 'paid' &&
        !payment?.appliedAt &&
        payment?.applicationReviewStatus === 'needs_review'

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8">
            <PageHeader
                eyebrow="Subscription"
                title="Paket Langganan"
                subtitle="Pilih paket untuk mengakses latihan CAT CPNS."
            />

            <CurrentSubscriptionCard
                subscription={subscription}
                hasActivePaid={hasActivePaidSubscription}
            />

            <CheckoutNotices
                storageWarning={storageWarning}
                needsReview={needsReview}
                paymentId={paymentId}
                checkoutError={checkoutError}
                hasMutationError={checkoutMutation.isError}
            />

            <section
                id="daftar-paket"
                aria-labelledby="plans-title"
                className="scroll-mt-20 space-y-5"
            >
                <h2 id="plans-title" className="text-[19px] font-bold text-foreground">
                    Pilih Paket
                </h2>

                {tiers.length === 0 ? (
                    <EmptyState
                        icon={Crown}
                        title="Paket langganan belum tersedia"
                        description="Paket langganan akan muncul di sini."
                    />
                ) : (
                    <div className="grid gap-6 pt-3 md:grid-cols-2 xl:grid-cols-3">
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
            </section>
        </div>
    )
}

export default SubscriptionPage