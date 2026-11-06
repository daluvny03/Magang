import { TIME_STATUS } from '@/user/constants/timeStatus'

function TimeStatusBadge({ statusKey }) {
  const config = TIME_STATUS[statusKey]
  const Icon = config.Icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-semibold ${config.badge}`}
    >
      <Icon size={14} aria-hidden="true" />
      {config.label}
    </span>
  )
}

export default TimeStatusBadge