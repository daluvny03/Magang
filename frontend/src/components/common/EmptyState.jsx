import { Inbox } from 'lucide-react'

function EmptyState({ title = 'No data', message, description, action }) {
  const text = message || description

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Inbox size={22} />
      </div>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {text && <p className="max-w-sm text-xs text-gray-500">{text}</p>}
      {action}
    </div>
  )
}

export default EmptyState
