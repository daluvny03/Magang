import { getPassingStatus } from '@/user/constants/passingStatus'

function PassingBadge({ status, variant = 'short' }) {
  const config = getPassingStatus(status)
  const Icon = config.Icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-semibold ${config.badge}`}
    >
      <Icon size={14} aria-hidden="true" />

      {variant === 'long' ? config.label : config.shortLabel}
    </span>
  )
}

export default PassingBadge