function PageHeader({ eyebrow, title, subtitle, actions, className = '' }) {
  return (
    <header
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow && (
          <p className="text-[13px] font-semibold text-primary-700">{eyebrow}</p>
        )}

        <h1 className="text-[26px] font-bold leading-tight text-foreground sm:text-[30px]">
          {title}
        </h1>

        {subtitle && (
          <p className="max-w-2xl text-[14px] leading-6 text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  )
}

export default PageHeader