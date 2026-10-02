import { Search, X } from 'lucide-react'

function UserFilters({ search, role, onSearchChange, onRoleChange, onReset }) {
  const hasFilter = search || role
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input value={search} onChange={onSearchChange} placeholder="Search name or email..." className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500" />
        </div>
        <select value={role} onChange={onRoleChange} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
          <option value="">All roles</option><option value="admin">Admin</option><option value="user">User</option>
        </select>
        <button type="button" onClick={onReset} disabled={!hasFilter} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"><X size={17} /> Reset</button>
      </div>
    </div>
  )
}
export default UserFilters
