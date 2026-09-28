import { LoaderCircle } from 'lucide-react'

function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <LoaderCircle
          size={20}
          className="animate-spin"
        />

        <span>{text}</span>
      </div>
    </div>
  )
}

export default LoadingSpinner