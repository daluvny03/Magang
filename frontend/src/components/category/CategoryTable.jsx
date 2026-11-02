
import { Edit, Trash2 } from 'lucide-react'

import Badge from '../ui/Badge'
import DataTable from '../ui/DataTable'
import IconButton from '../ui/IconButton'

function CategoryTable({ categories, onEdit, onDelete }) {
    const columns = [
        {
            key: 'name',
            header: 'Subcategory',
            render: (category) => (
                <span className="font-medium text-gray-900">
                    {category.name}
                </span>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            render: (category) => (
                <span className="text-gray-500">
                    {category.description || '-'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (category) => (
                <Badge tone={category.is_active ? 'green' : 'gray'}>
                    {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            hideable: false,
            className: 'text-right',
            render: (category) => (
                <div className="flex justify-end gap-1">
                    <IconButton
                        label="Edit subcategory"
                        onClick={() => onEdit(category)}
                    >
                        <Edit size={17} />
                    </IconButton>

                    <IconButton
                        label="Delete subcategory"
                        onClick={() => onDelete(category)}
                        className="hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={17} />
                    </IconButton>
                </div>
            ),
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={categories}
        />
    )
}

export default CategoryTable
