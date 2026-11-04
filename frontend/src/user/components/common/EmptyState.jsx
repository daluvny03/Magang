function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center ${className}`}
    >
      {Icon && (
        <span
          aria-hidden="true"
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
        >
          <Icon size={28} />
        </span>
      )}

      <h2 className="text-[17px] font-bold text-foreground">{title}</h2>

      {description && (
        <p className="mt-1.5 max-w-md text-[14px] leading-6 text-muted-foreground">
          {description}
        </p>
      )}

      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}

export default EmptyState
