import { Eye } from 'lucide-react'
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '-'
function UserTable({ users, onView }) {
  return <div className="overflow-hidden rounded-xl border border-gray-200 bg-white"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50"><tr>{['Name','Email','Role','Joined'].map(x => <th key={x} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{x}</th>)}<th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th></tr></thead>
    <tbody className="divide-y divide-gray-200">{users.map(user => <tr key={user.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td><td className="px-6 py-4 text-sm text-gray-600">{user.email}</td><td className="px-6 py-4"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">{user.role}</span></td><td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td><td className="px-6 py-4 text-right"><button type="button" onClick={() => onView(user)} title="View user" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"><Eye size={17}/></button></td></tr>)}</tbody>
  </table></div></div>
}
export default UserTable
