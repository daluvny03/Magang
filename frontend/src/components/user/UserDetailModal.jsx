import { X } from 'lucide-react'
import LoadingSpinner from '../common/LoadingSpinner'
const formatDate = (value) => value ? new Date(value).toLocaleString() : '-'
function UserDetailModal({ isOpen, response, isLoading, onClose }) {
  if (!isOpen) return null
  const user = response?.data
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
    <div className="flex items-center justify-between border-b px-6 py-4"><div><h2 className="text-xl font-semibold text-gray-900">User Detail</h2><p className="text-sm text-gray-500">Account information from the admin API.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={20}/></button></div>
    {isLoading ? <div className="flex min-h-56 items-center justify-center"><LoadingSpinner/></div> : !user ? <div className="p-6 text-sm text-red-600">Unable to load user detail.</div> : <div className="grid gap-5 p-6 sm:grid-cols-2"><Info label="Name" value={user.name}/><Info label="Email" value={user.email}/><Info label="Role" value={user.role}/><Info label="User ID" value={user.id}/><Info label="Created At" value={formatDate(user.createdAt)}/><Info label="Updated At" value={formatDate(user.updatedAt)}/></div>}
  </div></div>
}
function Info({label,value}) { return <div><p className="text-xs font-medium uppercase text-gray-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-gray-800">{value || '-'}</p></div> }
export default UserDetailModal
