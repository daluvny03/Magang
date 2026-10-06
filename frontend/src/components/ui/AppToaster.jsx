import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from 'lucide-react'
import { Toaster } from 'sonner'

function AppToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      duration={3500}
      style={{ fontFamily: 'inherit' }}
      icons={{
        success: <CheckCircle2 size={20} className="text-primary-500" />,
        error: <XCircle size={20} className="text-red-500" />,
        warning: <AlertTriangle size={20} className="text-yellow-500" />,
        info: <Info size={20} className="text-primary-500" />,
        loading: <Loader2 size={20} className="animate-spin text-primary-500" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-center gap-3 rounded-xl border border-l-2 bg-white p-4 text-sm shadow-lg',
          title: 'font-medium text-gray-900',
          description: 'mt-0.5 text-xs text-gray-500',
          icon: 'shrink-0',
          content: 'min-w-0 flex-1',
          closeButton:
            'rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700',
          actionButton:
            'rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600',
          cancelButton:
            'rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200',
          success: 'border-gray-100 border-l-primary-500',
          error: 'border-gray-100 border-l-red-500',
          warning: 'border-gray-100 border-l-yellow-500',
          info: 'border-gray-100 border-l-primary-500',
          loading: 'border-gray-100 border-l-primary-500',
        },
      }}
    />
  )
}

export default AppToaster