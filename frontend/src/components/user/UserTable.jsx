import { Eye } from 'lucide-react'
import Badge from '../ui/Badge'
import DataTable from '../ui/DataTable'
import IconButton from '../ui/IconButton'

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('id-ID') : '-'

function UserTable({ users, onView }) {
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (u) => (
        <span className="font-medium text-gray-900">{u.name}</span>
      ),
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <Badge tone={u.role === 'admin' ? 'primary' : 'gray'}>{u.role}</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (u) => formatDate(u.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      hideable: false,
      className: 'text-right',
      render: (u) => (
        <IconButton label="View user" onClick={() => onView(u)}>
          <Eye size={17} />
        </IconButton>
      ),
    },
  ]

  return <DataTable columns={columns} data={users} columnToggle />
}

export default UserTable