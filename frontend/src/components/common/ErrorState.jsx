import { AlertCircle, RotateCcw } from 'lucide-react'
import Button from '../ui/Button'

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertCircle size={22} />
      </div>
      {message && <p className="max-w-sm text-xs text-gray-500">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RotateCcw size={14} />
          Try again
        </Button>
      )}
    </div>
  )
}

export default ErrorState