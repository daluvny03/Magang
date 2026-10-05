import { RotateCcw } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

function UserFilters({
  search,
  role,
  limit,
  onSearchChange,
  onRoleChange,
  onLimitChange,
  onReset,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-20">
            <Select value={limit} onChange={onLimitChange}>
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>
          entries per page
        </div>

        <div className="w-40">
          <Select value={role} onChange={onRoleChange}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Search:</span>
        <div className="w-56">
          <Input
            value={search}
            onChange={onSearchChange}
            placeholder="Name or email"
          />
        </div>
        <Button variant="soft" onClick={onReset}>
          <RotateCcw size={15} />
          Reset
        </Button>
      </div>
    </div>
  )
}

export default UserFilters