import { useMemo, useState } from 'react'
import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import Pagination from '../../../components/common/Pagination'
import UserDetailModal from '../../../components/user/UserDetailModal'
import UserFilters from '../../../components/user/UserFilters'
import UserTable from '../../../components/user/UserTable'
import Card from '../../../components/ui/Card'
import { useDebounce } from '../../../hooks/useDebounce'
import { useUser, useUsers } from '../../../hooks/useUsers'

function UserPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchInput, setSearchInput] = useState('')
  const [role, setRole] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const search = useDebounce(searchInput.trim())

  const params = useMemo(
    () => ({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(role ? { role } : {}),
    }),
    [page, limit, search, role]
  )

  const { data: response, isLoading, isError, refetch } = useUsers(params)
  const { data: detailResponse, isLoading: isDetailLoading } = useUser(
    selectedId,
    isDetailOpen
  )

  const users = response?.data || []
  const meta = response?.meta || { page: 1, totalPages: 0 }

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
    setPage(1)
  }

  const handleRoleChange = (e) => {
    setRole(e.target.value)
    setPage(1)
  }

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value))
    setPage(1)
  }

  const handleReset = () => {
    setSearchInput('')
    setRole('')
    setPage(1)
  }

  const handleView = (user) => {
    setSelectedId(user.id)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedId(null)
  }

  if (isLoading && !response) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load users"
        message="Unable to retrieve user data."
        onRetry={refetch}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse admin and user accounts.
        </p>
      </div>

      <Card className="space-y-4">
        <UserFilters
          search={searchInput}
          role={role}
          limit={limit}
          onSearchChange={handleSearchChange}
          onRoleChange={handleRoleChange}
          onLimitChange={handleLimitChange}
          onReset={handleReset}
        />

        {users.length === 0 ? (
          <EmptyState
            title="No users found"
            message={
              search || role
                ? 'No users match the current filters.'
                : 'There are no users to display.'
            }
          />
        ) : (
          <>
            <UserTable users={users} onView={handleView} />
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={limit}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <UserDetailModal
        isOpen={isDetailOpen}
        response={detailResponse}
        isLoading={isDetailLoading}
        onClose={handleCloseDetail}
      />
    </div>
  )
}

export default UserPage