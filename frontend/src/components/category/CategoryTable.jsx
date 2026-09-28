import {
  Edit,
  Trash2,
} from 'lucide-react'

function CategoryTable({
  categories,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-5 py-3 font-semibold text-gray-700">
                Name
              </th>

              <th className="px-5 py-3 font-semibold text-gray-700">
                Parent
              </th>

              <th className="px-5 py-3 font-semibold text-gray-700">
                Description
              </th>

              <th className="px-5 py-3 font-semibold text-gray-700">
                Status
              </th>

              <th className="px-5 py-3 text-right font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="hover:bg-gray-50"
              >
                <td className="px-5 py-4 font-medium text-gray-900">
                  {category.name}
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {category.parent?.name ||
                    category.parentName ||
                    '-'}
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {category.description || '-'}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      category.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {category.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(category)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      title="Edit category"
                    >
                      <Edit size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(category)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      title="Delete category"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CategoryTable