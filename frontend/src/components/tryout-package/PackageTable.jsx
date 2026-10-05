import { Edit, Eye } from 'lucide-react'
import Badge from '../ui/Badge'
import DataTable from '../ui/DataTable'
import IconButton from '../ui/IconButton'

function PackageTable({ packages, onView, onEdit }) {
  const columns = [
    {
      key: 'name',
      header: 'Package',
      render: (item) => (
        <div className="max-w-sm">
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
            {item.description || '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'durationMinutes',
      header: 'Duration',
      render: (item) => `${item.durationMinutes} min`,
    },
    {
      key: 'questionCount',
      header: 'Questions',
      render: (item) => item.questionCount ?? 0,
    },
    {
      key: 'passingScore',
      header: 'Passing Score',
      render: (item) => item.passingScore ?? '-',
    },
    {
      key: 'isFree',
      header: 'Access',
      render: (item) => (
        <Badge tone={item.isFree ? 'green' : 'primary'}>
          {item.isFree ? 'Free' : 'Paid'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge tone={item.status === 'published' ? 'green' : 'gray'}>
          {item.status || '-'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      hideable: false,
      className: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-1">
          <IconButton label="View package" onClick={() => onView(item)}>
            <Eye size={17} />
          </IconButton>
          <IconButton label="Edit package" onClick={() => onEdit(item)}>
            <Edit size={17} />
          </IconButton>
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} data={packages} columnToggle />
}

export default PackageTable