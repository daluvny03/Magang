import { Edit, Trash2 } from 'lucide-react'
import Badge from '../ui/Badge'
import DataTable from '../ui/DataTable'
import IconButton from '../ui/IconButton'

function CategoryTable({ categories, onEdit, onDelete }) {
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (c) => <span className="font-medium text-gray-900">{c.name}</span>,
    },
    {
      key: 'parent',
      header: 'Parent',
      render: (c) => c.parent?.name || c.parentName || '-',
    },
    {
      key: 'description',
      header: 'Description',
      render: (c) => c.description || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <Badge tone={c.is_active ? 'green' : 'gray'}>
          {c.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      hideable: false,
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <IconButton label="Edit category" onClick={() => onEdit(c)}>
            <Edit size={17} />
          </IconButton>
          <IconButton
            label="Delete category"
            onClick={() => onDelete(c)}
            className="hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={17} />
          </IconButton>
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} data={categories} />
}

export default CategoryTable