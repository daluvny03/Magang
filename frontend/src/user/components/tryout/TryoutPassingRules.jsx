import { CATEGORY_ORDER } from '@/user/constants/categoryStyles'

const chipClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[13px] font-semibold text-foreground'

const orderOf = (slug) => {
  const index = CATEGORY_ORDER.indexOf(slug)

  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

function TryoutPassingRules({ tryout }) {
  if (tryout.passingMode === 'category') {
    const grades = Object.entries(tryout.passingGrades ?? {})
      .filter(([, grade]) => grade != null)
      .sort(([a], [b]) => orderOf(a) - orderOf(b))

    if (!grades.length) {
      return (
        <span className="text-[14px] font-normal text-muted-foreground">
          Batas per kategori belum tersedia
        </span>
      )
    }

    return (
      <span className="flex flex-wrap gap-2">
        {grades.map(([slug, grade]) => (
          <span key={slug} className={chipClass}>
            <span className="uppercase text-muted-foreground">{slug}</span>
            {grade}
          </span>
        ))}
      </span>
    )
  }

  if (tryout.passingMode === 'none') {
    return (
      <span className="text-[14px] font-normal text-muted-foreground">
        Tidak diterapkan
      </span>
    )
  }

  if (tryout.passingScore == null) {
    return (
      <span className="text-[14px] font-normal text-muted-foreground">
        Belum tersedia
      </span>
    )
  }

  return (
    <span className={chipClass}>
      <span className="text-muted-foreground">Total</span>
      {tryout.passingScore}
    </span>
  )
}

export default TryoutPassingRules