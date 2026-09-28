import { FolderOpen } from 'lucide-react'

function EmptyState({
  title = 'No data found',
  description = 'There is no data to display.',
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
      <FolderOpen
        size={32}
        className="text-gray-400"
      />

      <h3 className="mt-3 font-medium text-gray-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </div>
  )
}

export default EmptyState