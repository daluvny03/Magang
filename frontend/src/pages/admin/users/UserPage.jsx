import { useMemo, useState } from 'react'
import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import Pagination from '../../../components/common/Pagination'
import UserFilters from '../../../components/user/UserFilters'
import UserTable from '../../../components/user/UserTable'
import Card from '../../../components/ui/Card'
import { useDebounce } from '../../../hooks/useDebounce'
import { useUsers } from '../../../hooks/useUsers'

function UserPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchInput, setSearchInput] = useState('')

  const search = useDebounce(searchInput.trim())

  const params = useMemo(
    () => ({
      page,
      limit,
      ...(search ? { search } : {}),
    }),
    [page, limit, search]
  )

  const { data: response, isLoading, isError, refetch } = useUsers(params)

  const users = response?.data || []
  const meta = response?.meta || { page: 1, totalPages: 0 }

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value)
    setPage(1)
  }

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value))
    setPage(1)
  }

  const handleReset = () => {
    setSearchInput('')
    setPage(1)
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
          Pantau tingkat subscription dan masa berlaku langganan user.
        </p>
      </div>

      <Card className="space-y-4">
        <UserFilters
          search={searchInput}
          limit={limit}
          onSearchChange={handleSearchChange}
          onLimitChange={handleLimitChange}
          onReset={handleReset}
        />

        {users.length === 0 ? (
          <EmptyState
            title="No users found"
            message={
              search
                ? 'No users match the current filters.'
                : 'There are no users to display.'
            }
          />
        ) : (
          <>
            <UserTable users={users} />
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
    </div>
  )
}

export default UserPage
