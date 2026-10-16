import Badge from '../ui/Badge'
import DataTable from '../ui/DataTable'

const formatDate = (value) =>
  value
    ? `${new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta',
      })} WIB`
    : '—'

const subscriptionStatuses = {
  active: { label: 'Aktif', tone: 'green' },
  expired: { label: 'Kedaluwarsa', tone: 'red' },
  upcoming: { label: 'Belum dimulai', tone: 'primary' },
  inactive: { label: 'Nonaktif', tone: 'gray' },
  cancelled: { label: 'Dibatalkan', tone: 'gray' },
  canceled: { label: 'Dibatalkan', tone: 'gray' },
}

function UserTable({ users }) {
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
      key: 'subscription',
      header: 'Subscription',
      render: (u) => {
        if (!u.subscription) {
          return <span>Belum memiliki subscription</span>
        }

        const status = subscriptionStatuses[u.subscription.effectiveStatus] ?? {
          label: u.subscription.effectiveStatus || 'Status tidak tersedia',
          tone: 'gray',
        }

        return (
          <div className="flex flex-wrap items-center gap-2">
            <span>{u.subscription.tier?.name || '—'}</span>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
        )
      },
    },
    {
      key: 'expiredAt',
      header: 'Kedaluwarsa',
      render: (u) => formatDate(u.subscription?.expiredAt),
    },
  ]

  return <DataTable columns={columns} data={users} columnToggle />
}

export default UserTable
