import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const TONES = {
  warning: { box: 'border-amber-200 bg-amber-50 text-amber-900', Icon: AlertTriangle },
  danger: { box: 'border-red-200 bg-red-50 text-red-900', Icon: AlertCircle },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-900', Icon: CheckCircle2 },
  info: { box: 'border-primary-200 bg-primary-50 text-primary-700', Icon: Info },
}

function Notice({ tone = 'warning', title, role = 'alert', className = '', children }) {
  const { box, Icon } = TONES[tone]

  return (
    <div
      role={role}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-[14px] leading-6 ${box} ${className}`}
    >
      <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0" />

      <div className="min-w-0">
        {title && <p className="font-bold">{title}</p>}

        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
    </div>
  )
}

export default Notice