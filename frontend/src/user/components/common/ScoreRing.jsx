import { useId } from 'react'

const RING = { track: '#f1f4f6', start: '#337379', end: '#51a8b1' }

function ScoreRing({
  value = 0,
  max = 100,
  size = 168,
  thickness = 12,
  label,
  sublabel,
  ariaLabel,
  className = '',
}) {
  const gradientId = `ring-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const safeMax = Number(max) > 0 ? Number(max) : 100
  const ratio = Math.max(0, Math.min(1, (Number(value) || 0) / safeMax))
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} aria-hidden="true" className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={RING.start} />
            <stop offset="100%" stopColor={RING.end} />
          </linearGradient>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={RING.track}
          strokeWidth={thickness}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[30px] font-bold leading-none text-foreground">
          {label ?? value}
        </span>

        {sublabel && (
          <span className="mt-1.5 text-[13px] font-medium text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}

export default ScoreRing