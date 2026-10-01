import { Edit, Eye } from 'lucide-react'

function PackageTable({ packages, onView, onEdit }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Package', 'Duration', 'Questions', 'Passing Score', 'Access', 'Status'].map((label) => (
                <th key={label} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {packages.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="max-w-sm px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-gray-500">{item.description || '-'}</p>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{item.durationMinutes} min</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{item.questionCount ?? 0}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{item.passingScore ?? '-'}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.isFree ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.isFree ? 'Free' : 'Paid'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                    {item.status || '-'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onView(item)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" title="View package">
                      <Eye size={17} />
                    </button>
                    <button type="button" onClick={() => onEdit(item)} className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600" title="Edit package">
                      <Edit size={17} />
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

export default PackageTable
