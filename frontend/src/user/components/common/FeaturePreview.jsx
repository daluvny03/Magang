import DotPattern from './DotPattern'

function FeaturePreview({
  icon: HeroIcon,
  badge,
  title,
  description,
  sectionTitle,
  sectionDescription,
  features,
  gridClass = 'sm:grid-cols-2',
  children,
}) {
  const BadgeIcon = badge.icon

  return (
    <section
      aria-labelledby="feature-preview-title"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
    >
      <div className="relative isolate bg-linear-to-br from-primary-50 via-card to-primary-100 px-6 py-12 text-center sm:px-10 sm:py-14">
        <DotPattern />

        <div className="relative">
          <span
            aria-hidden="true"
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-card text-primary-700 shadow-sm"
          >
            <HeroIcon size={38} />
          </span>

          <div className="mt-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-[13px] font-semibold text-amber-800 shadow-sm">
              <BadgeIcon size={14} aria-hidden="true" />
              {badge.label}
            </span>
          </div>

          <h1
            id="feature-preview-title"
            className="mt-5 text-[28px] font-bold leading-tight text-foreground sm:text-[34px]"
          >
            {title}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-[16px]">
            {description}
          </p>
        </div>
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div className="text-center">
          <h2 className="text-[19px] font-bold text-foreground">{sectionTitle}</h2>

          <p className="mt-2 text-[14px] text-muted-foreground">
            {sectionDescription}
          </p>
        </div>

        <ul className={`mt-7 grid gap-4 ${gridClass}`}>
          {features.map(({ icon: Icon, title: featureTitle, description: featureText }) => (
            <li
              key={featureTitle}
              className="rounded-2xl border border-border bg-muted/40 p-5"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700"
              >
                <Icon size={24} />
              </span>

              <h3 className="mt-4 text-[16px] font-bold text-foreground">
                {featureTitle}
              </h3>

              <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                {featureText}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-3">{children}</div>
      </div>
    </section>
  )
}

export default FeaturePreview