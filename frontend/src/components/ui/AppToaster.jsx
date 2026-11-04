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
        success: <CheckCircle2 size={20} className="text-emerald-600" />,
        error: <XCircle size={20} className="text-red-600" />,
        warning: <AlertTriangle size={20} className="text-amber-600" />,
        info: <Info size={20} className="text-blue-600" />,
        loading: <Loader2 size={20} className="animate-spin text-slate-500" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-center gap-3 rounded-xl border border-l-4 p-4 text-sm shadow-lg',
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
          success: 'border-emerald-200 border-l-emerald-500 bg-emerald-50',
          error: 'border-red-200 border-l-red-500 bg-red-50',
          warning: 'border-amber-200 border-l-amber-500 bg-amber-50',
          info: 'border-blue-200 border-l-blue-500 bg-blue-50',
          loading: 'border-slate-200 border-l-slate-400 bg-slate-50',
        },
      }}
    />
  )
}

export default AppToaster
