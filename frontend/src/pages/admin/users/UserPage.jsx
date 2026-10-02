import { useMemo, useState } from 'react'
import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import Pagination from '../../../components/common/Pagination'
import UserDetailModal from '../../../components/user/UserDetailModal'
import UserFilters from '../../../components/user/UserFilters'
import UserTable from '../../../components/user/UserTable'
import { useUser, useUsers } from '../../../hooks/useUsers'

function UserPage() {
  const [page,setPage] = useState(1), [search,setSearch] = useState(''), [role,setRole] = useState(''), [selectedId,setSelectedId] = useState(null), [isDetailOpen,setIsDetailOpen] = useState(false)
  const limit = 20
  const params = useMemo(() => ({ page, limit, ...(search.trim()?{search:search.trim()}:{}), ...(role?{role}:{}) }), [page,search,role])
  const {data:response,isLoading,isError,refetch} = useUsers(params)
  const {data:detailResponse,isLoading:isDetailLoading} = useUser(selectedId,isDetailOpen)
  const users=response?.data||[], meta=response?.meta||{page:1,totalPages:0}
  if(isLoading&&!response) return <div className="flex min-h-[400px] items-center justify-center"><LoadingSpinner/></div>
  if(isError) return <ErrorState title="Failed to load users" message="Unable to retrieve user data." onRetry={refetch}/>
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="mt-1 text-sm text-gray-500">Browse admin and user accounts.</p></div>
    <UserFilters search={search} role={role} onSearchChange={e=>{setSearch(e.target.value);setPage(1)}} onRoleChange={e=>{setRole(e.target.value);setPage(1)}} onReset={()=>{setSearch('');setRole('');setPage(1)}}/>
    {users.length===0?<EmptyState title="No users found" message={search||role?'No users match the current filters.':'There are no users to display.'}/>:<><UserTable users={users} onView={u=>{setSelectedId(u.id);setIsDetailOpen(true)}}/><Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage}/></>}
    <UserDetailModal isOpen={isDetailOpen} response={detailResponse} isLoading={isDetailLoading} onClose={()=>{setIsDetailOpen(false);setSelectedId(null)}}/>
  </div>
}
export default UserPage
