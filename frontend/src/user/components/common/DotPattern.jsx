const FADE_MASK = 'linear-gradient(to bottom left, black 5%, transparent 70%)'

function DotPattern({ className = 'text-foreground opacity-[0.08]', size = 18 }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 -z-10 ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(circle, currentColor 1.4px, transparent 1.8px)',
        backgroundSize: `${size}px ${size}px`,
        maskImage: FADE_MASK,
        WebkitMaskImage: FADE_MASK,
      }}
    />
  )
}

export default DotPattern