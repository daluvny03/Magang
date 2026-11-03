import { AlertCircle, RefreshCw } from 'lucide-react'

import Surface from './Surface'
import { buttonClass } from './buttonStyles'

const NON_RETRYABLE = [401, 403, 404, 422]

function SectionError({ title, error, onRetry, className = '' }) {
  const status = error?.response?.status

  return (
    <Surface
      as="section"
      role="alert"
      className={`border-red-200 bg-red-50 p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          size={22}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-destructive"
        />

        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-red-900">{title}</h2>

          <p className="mt-1 text-[14px] leading-6 text-red-800">
            {error?.response?.data?.message ||
              'Terjadi kesalahan. Silakan coba lagi.'}
          </p>

          {onRetry && !NON_RETRYABLE.includes(status) && (
            <button
              type="button"
              onClick={() => onRetry()}
              className={`${buttonClass.outline} mt-3`}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    </Surface>
  )
}

export default SectionError