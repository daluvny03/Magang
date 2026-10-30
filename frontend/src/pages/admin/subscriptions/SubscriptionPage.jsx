
import { useMemo, useState } from 'react'
import {
    Crown,
    Eye,
    Plus,
    Search,
    Pencil,
    Power,
    PowerOff,
    Layers3,
    CircleCheck,
    CircleOff,
} from 'lucide-react'

import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import DataTable from '../../../components/ui/DataTable'
import StatCard from '../../../components/ui/StatCard'

import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { toast } from 'sonner'
import SubscriptionDetailModal from '../../../components/subscriptions/SubscriptionDetailModal'
import SubscriptionFormModal from '../../../components/subscriptions/SubscriptionFormModal'
import SubscriptionStatusDialog from '../../../components/subscriptions/SubscriptionStatusDialog'
import {
    useAdminSubscriptionTiers,
    useAdminSubscriptionTier,
    useCreateAdminSubscriptionTier,
    useUpdateAdminSubscriptionTier,
    useUpdateAdminSubscriptionTierStatus,
} from '../../../hooks/useAdminSubscriptions'

const formatCurrency = (value) => {
    const price = Number(value)

    if (!Number.isFinite(price)) {
        return '-'
    }

    if (price === 0) {
        return 'Gratis'
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(price)
}

const formatDuration = (duration) => {
    if (!duration) {
        return 'Belum diatur'
    }

    const labels = {
        day: 'hari',
        month: 'bulan',
        year: 'tahun',
    }

    return `${duration.value} ${labels[duration.unit] || duration.unit
        }`
}

function SubscriptionPage() {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [formOpen, setFormOpen] = useState(false)
    const [formMode, setFormMode] = useState('create')
    const [selectedTier, setSelectedTier] = useState(null)
    const [detailTier, setDetailTier] = useState(null)
    const selectedTierId = selectedTier?.id ?? null
    const tierDetailQuery = useAdminSubscriptionTier(
        selectedTierId
    )
    const fullSelectedTier =
        tierDetailQuery.data?.data ?? null
    const createMutation = useCreateAdminSubscriptionTier()
    const updateMutation = useUpdateAdminSubscriptionTier()
    const [statusTier, setStatusTier] = useState(null)

    const statusMutation =
        useUpdateAdminSubscriptionTierStatus()
    const isMutating =
        createMutation.isPending ||
        updateMutation.isPending ||
        statusMutation.isPending

    const isSaving =
        createMutation.isPending || updateMutation.isPending

    const openCreateModal = () => {
        if (isMutating) return
        setSelectedTier(null)
        setFormMode('create')
        setFormOpen(true)
    }

    const openEditModal = (tier) => {
        if (tier.slug === 'free') return
        if (isMutating) return
        setSelectedTier(tier)
        setFormMode('edit')
        setFormOpen(true)
    }

    const openDetailModal = (tier) => {
        if (isMutating) return

        setSelectedTier(tier)
        setDetailTier(tier.id)
    }

    const closeDetailModal = () => {
        setDetailTier(null)
        setSelectedTier(null)
    }

    const closeFormModal = () => {
        if (isSaving) return
        if (isMutating) return
        setFormOpen(false)
        setSelectedTier(null)
    }

    const handleFormSubmit = async (payload) => {
        if (formMode === 'edit') {
            await updateMutation.mutateAsync({
                id: selectedTier.id,
                payload,
            })

            toast.success('Subscription berhasil diperbarui.')
        } else {
            await createMutation.mutateAsync(payload)

            toast.success('Subscription berhasil ditambahkan.')
        }

        setFormOpen(false)
        setSelectedTier(null)
    }

    const subscriptionsQuery = useAdminSubscriptionTiers()

    const subscriptions = useMemo(
        () => subscriptionsQuery.data?.data || [],
        [subscriptionsQuery.data]
    )

    const statistics = useMemo(() => {
        return {
            total: subscriptions.length,
            active: subscriptions.filter(
                (tier) => tier.isActive
            ).length,
            inactive: subscriptions.filter(
                (tier) => !tier.isActive
            ).length,
        }
    }, [subscriptions])

    const filteredSubscriptions = useMemo(() => {
        const keyword = search.trim().toLowerCase()

        return subscriptions.filter((tier) => {
            const matchesSearch = [
                tier.name,
                tier.slug,
                tier.description,
            ].some((value) =>
                String(value || '')
                    .toLowerCase()
                    .includes(keyword)
            )

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && tier.isActive) ||
                (statusFilter === 'inactive' && !tier.isActive)

            return matchesSearch && matchesStatus
        })
    }, [subscriptions, search, statusFilter])

    const columns = [
        {
            key: 'name',
            header: 'Subscription',
            render: (tier) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                            {tier.name}
                        </span>

                        {tier.slug === 'free' && (
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                Default
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-gray-500">
                        {tier.slug}
                    </p>
                </div>
            ),
        },
        {
            key: 'price',
            header: 'Harga',
            render: (tier) => (
                <span className="font-medium text-gray-900">
                    {formatCurrency(tier.price)}
                </span>
            ),
        },
        {
            key: 'duration',
            header: 'Durasi',
            render: (tier) =>
                tier.slug === 'free'
                    ? 'Tidak berlaku'
                    : formatDuration(tier.duration),
        },
        {
            key: 'level',
            header: 'Level',
            render: (tier) => (
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                    Level {tier.level}
                </span>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (tier) => (
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tier.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}
                >
                    {tier.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Action',
            render: (tier) => {
                if (tier.slug === 'free') {
                    return (
                        <button
                            type="button"
                            title="Lihat detail subscription Free"
                            aria-label={`Detail ${tier.name}`}
                            onClick={() => openDetailModal(tier)}
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                        >
                            <Eye size={17} />
                        </button>
                    )
                }

                return (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            title="Lihat detail subscription"
                            aria-label={`Detail ${tier.name}`}
                            onClick={() => openDetailModal(tier)}
                            disabled={isMutating}
                            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                        >
                            <Eye size={17} />
                        </button>

                        <button
                            type="button"
                            title="Edit subscription"
                            disabled={isMutating}
                            aria-label={`Edit ${tier.name}`}
                            onClick={() => openEditModal(tier)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                            <Pencil size={17} />
                        </button>

                        <button
                            type="button"
                            title={
                                tier.isActive
                                    ? 'Nonaktifkan subscription'
                                    : 'Aktifkan subscription'
                            }
                            aria-label={
                                tier.isActive
                                    ? `Nonaktifkan ${tier.name}`
                                    : `Aktifkan ${tier.name}`
                            }
                            onClick={() => openStatusDialog(tier)}
                            disabled={statusMutation.isPending}
                            className={`rounded-lg p-2 transition disabled:opacity-50 ${tier.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                                }`}
                        >
                            {tier.isActive ? (
                                <PowerOff size={17} />
                            ) : (
                                <Power size={17} />
                            )}
                        </button>
                    </div>
                )
            },
        },
    ]

    const openStatusDialog = (tier) => {
        if (tier.slug === 'free') return

        setStatusTier(tier)
    }

    const closeStatusDialog = () => {
        if (statusMutation.isPending) return

        setStatusTier(null)
    }

    const handleStatusConfirm = async () => {
        if (!statusTier || statusMutation.isPending) {
            return
        }

        const nextStatus = !statusTier.isActive

        try {
            await statusMutation.mutateAsync({
                id: statusTier.id,
                isActive: nextStatus,
            })

            toast.success(
                nextStatus
                    ? 'Subscription berhasil diaktifkan.'
                    : 'Subscription berhasil dinonaktifkan.'
            )

            setStatusTier(null)
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                'Gagal mengubah status subscription.'
            )
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Subscription
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Kelola tier subscription yang tersedia
                        untuk pengguna.
                    </p>
                </div>

                <Button
                    onClick={openCreateModal}
                    disabled={isMutating}
                >
                    <Plus size={18} />
                    Tambah Subscription
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    title="Total Tier"
                    value={statistics.total}
                    icon={Layers3}
                />

                <StatCard
                    title="Tier Aktif"
                    value={statistics.active}
                    icon={CircleCheck}
                />

                <StatCard
                    title="Tier Nonaktif"
                    value={statistics.inactive}
                    icon={CircleOff}
                />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row">
                    <div className="relative w-full max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <Input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Cari subscription..."
                            className="pl-9"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>
                </div>

                {subscriptionsQuery.isLoading ? (
                    <LoadingSpinner text="Memuat subscription..." />
                ) : subscriptionsQuery.isError ? (
                    <ErrorState
                        message={
                            subscriptionsQuery.error?.response?.data
                                ?.message ||
                            'Gagal memuat subscription.'
                        }
                        onRetry={() => subscriptionsQuery.refetch()}
                    />
                ) : filteredSubscriptions.length === 0 ? (
                    <EmptyState
                        title="Subscription tidak ditemukan"
                        description={
                            search || statusFilter !== 'all'
                                ? 'Tidak ada subscription yang sesuai filter.'
                                : 'Belum ada subscription.'
                        }
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredSubscriptions}
                    />
                )}
            </div>
            {formOpen && (
                formMode === 'create' ? (
                    <SubscriptionFormModal
                        key="create"
                        mode="create"
                        tier={null}
                        availableTiers={subscriptions}
                        isSubmitting={isSaving}
                        onClose={closeFormModal}
                        onSubmit={handleFormSubmit}
                    />
                ) : tierDetailQuery.isPending ? (
                    <LoadingSpinner text="Memuat detail subscription..." />
                ) : tierDetailQuery.isError || !fullSelectedTier ? (
                    <div
                        role="alert"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-6">
                            <p className="text-sm text-red-600">
                                Gagal memuat detail subscription.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => tierDetailQuery.refetch()}
                                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white"
                                >
                                    Coba Lagi
                                </button>

                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    className="rounded-lg border px-4 py-2 text-sm"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <SubscriptionFormModal
                        key={`edit-${fullSelectedTier.id}`}
                        mode="edit"
                        tier={fullSelectedTier}
                        availableTiers={subscriptions}
                        isSubmitting={isSaving}
                        onClose={closeFormModal}
                        onSubmit={handleFormSubmit}
                    />
                )
            )}

            {detailTier !== null && (
                tierDetailQuery.isPending ? (
                    <LoadingSpinner text="Memuat detail subscription..." />
                ) : tierDetailQuery.isError || !fullSelectedTier ? (
                    <div
                        role="alert"
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    >
                        <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-6">
                            <p className="text-sm text-red-600">
                                Gagal memuat detail subscription.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => tierDetailQuery.refetch()}
                                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white"
                                >
                                    Coba Lagi
                                </button>
                                <button
                                    type="button"
                                    onClick={closeDetailModal}
                                    className="rounded-lg border px-4 py-2 text-sm"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <SubscriptionDetailModal
                        key={`detail-${fullSelectedTier.id}`}
                        tier={fullSelectedTier}
                        onClose={closeDetailModal}
                    />
                )
            )}
            {statusTier && (
                <SubscriptionStatusDialog
                    tier={statusTier}
                    isSubmitting={statusMutation.isPending}
                    onClose={closeStatusDialog}
                    onConfirm={handleStatusConfirm}
                />
            )}
        </div>
    )
}

export default SubscriptionPage
