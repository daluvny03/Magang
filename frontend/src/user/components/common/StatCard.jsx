import Surface from './Surface'

const TONES = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-sky-50 text-sky-800',
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-50 text-amber-800',
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  hint,
  tone = 'neutral',
  className = '',
}) {
  return (
    <Surface className={`p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-muted-foreground">
            {label}
          </p>

          <p className="mt-1.5 break-words text-[26px] font-bold leading-tight text-foreground">
            {value}
            {suffix && (
              <span className="ml-1.5 text-[15px] font-semibold text-muted-foreground">
                {suffix}
              </span>
            )}
          </p>
        </div>

        {Icon && (
          <span
            aria-hidden="true"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone] ?? TONES.neutral}`}
          >
            <Icon size={22} />
          </span>
        )}
      </div>

      {hint && (
        <p className="mt-3 text-[13px] leading-5 text-muted-foreground">
          {hint}
        </p>
      )}
    </Surface>
  )
}

export default StatCard