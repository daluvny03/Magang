import { AlertCircle, RefreshCcw } from 'lucide-react'

function ErrorState({
  message = 'Failed to load data.',
  onRetry,
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
      <AlertCircle
        size={32}
        className="text-red-500"
      />

      <p className="mt-3 text-sm text-gray-600">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          <RefreshCcw size={16} />
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorState