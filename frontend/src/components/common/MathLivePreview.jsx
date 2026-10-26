
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import MathText from './MathText'

function MathLivePreview({
  content = '',
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        aria-expanded={isVisible}
        className="inline-flex items-center gap-2 text-xs font-medium text-primary-600 hover:text-primary-700"
      >
        {isVisible ? (
          <EyeOff size={14} />
        ) : (
          <Eye size={14} />
        )}

        {isVisible ? 'Hide Preview' : 'Show Preview'}
      </button>

      {isVisible && (
        <div className="mt-2 min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="mb-2 text-xs font-semibold text-gray-500">
            LaTeX Preview
          </p>

          {String(content ?? '').trim() ? (
            <MathText
              content={content}
              className="text-sm leading-6 text-gray-900"
            />
          ) : (
            <p className="text-xs italic text-gray-400">
              Start typing to see the preview.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default MathLivePreview
