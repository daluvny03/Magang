function SectionCard({
  title,
  description,
  icon: Icon,
  required = false,
  action,
  children,
}) {
  return (
    <section className="rounded-xl border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            {Icon && <Icon size={17} className="text-primary-600" />}
            {title}
            {required && <span className="text-red-500">*</span>}
          </h3>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
        {action}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  )
}

export default SectionCard