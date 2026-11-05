import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import Pagination from '../../../components/common/Pagination'
import UserFilters from '../../../components/user/UserFilters'
import UserTable from '../../../components/user/UserTable'
import SubscriptionDistribution from '../../../components/user/SubscriptionDistribution'
import Card from '../../../components/ui/Card'

import { useDebounce } from '../../../hooks/useDebounce'
import { useUsers } from '../../../hooks/useUsers'

const number = new Intl.NumberFormat('id-ID')

function UserPage() {
  const { tierId } = useParams()

  const selectedTierId = useMemo(() => {
    if (!tierId) return undefined
    if (tierId === 'all') return 'all'
    const parsed = Number(tierId)
    return Number.isSafeInteger(parsed) && parsed > 0
      ? parsed
      : null
  }, [tierId])

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const navigate = useNavigate()
  const handleOpenTier = (item) => {
    if (item.tierId === 'all') {
      navigate('/admin/users/tier/all')
      return
    }

    navigate(`/admin/users/tier/${item.tierId}`)
  }
  const search = useDebounce(searchInput.trim())

  useEffect(() => {
    setPage(1)
    setSearchInput('')
    setStartDate('')
    setEndDate('')
  }, [tierId])

  const params = useMemo(
    () => ({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(selectedTierId !== undefined && selectedTierId !== 'all'
        ? { tierId: selectedTierId }
        : {}),
    }),
    [
      page,
      limit,
      search,
      startDate,
      endDate,
      selectedTierId,
    ]
  )

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useUsers(params)
  const users = response?.data || []
  const meta = response?.meta || {
    page: 1,
    totalPages: 0,
    total: 0,
  }
  const subscriptionDistribution =
    response?.subscriptionDistribution || []

  const selectedTier = selectedTierId
    ? subscriptionDistribution.find(
      (item) => Number(item.tierId) === selectedTierId
    )
    : null

  const pageTitle =
    selectedTierId === undefined || selectedTierId === 'all'
      ? 'All Users'
      : selectedTier?.tierName || `Tier ${selectedTierId}`

  const handleResetFilters = () => {
    setSearchInput('')
    setStartDate('')
    setEndDate('')
    setLimit(10)
    setPage(1)
  }

  if (selectedTierId === null) {
    return (
      <ErrorState
        message="Subscription tier tidak valid."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          User Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Kelola user dan distribusi subscription.
        </p>
      </div>

      {selectedTierId === undefined ? (
        <SubscriptionDistribution
          distribution={subscriptionDistribution}
          onOpen={handleOpenTier}
        />
      ) : (
        <>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Kembali ke distribusi subscription
          </button>

          <Card>
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {pageTitle}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {number.format(meta.total)} user ditemukan.
                </p>
              </div>

              <UserFilters
                search={searchInput}
                limit={limit}
                startDate={startDate}
                endDate={endDate}
                onSearchChange={(value) => {
                  setSearchInput(value)
                  setPage(1)
                }}
                onLimitChange={(value) => {
                  setLimit(Number(value))
                  setPage(1)
                }}
                onStartDateChange={(value) => {
                  setStartDate(value)
                  setPage(1)
                }}
                onEndDateChange={(value) => {
                  setEndDate(value)
                  setPage(1)
                }}
                onReset={handleResetFilters}
              />

              {isLoading ? (
                <LoadingSpinner />
              ) : isError ? (
                <ErrorState
                  message="Gagal memuat data user."
                  onRetry={refetch}
                />
              ) : users.length === 0 ? (
                <EmptyState
                  title="User tidak ditemukan"
                  description="Tidak ada user yang sesuai dengan filter saat ini."
                />
              ) : (
                <UserTable users={users} />
              )}

              {!isLoading && !isError && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  limit={meta.limit}
                  onPageChange={setPage}
                />
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

export default UserPage
