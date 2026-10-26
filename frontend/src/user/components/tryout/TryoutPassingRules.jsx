function TryoutPassingRules({ tryout }) {
  if (tryout.passingMode === 'category') {
    const grades = Object.entries(tryout.passingGrades ?? {})
      .filter(([, grade]) => grade != null)
    return (
      <span className="flex flex-wrap gap-x-3 gap-y-1">
        {grades.length ? grades.map(([slug, grade]) => (
          <span key={slug}>{slug.toUpperCase()}: {grade}</span>
        )) : 'Batas per kategori belum tersedia'}
      </span>
    )
  }

  if (tryout.passingMode === 'none') return <span>Tidak diterapkan</span>
  return <span>{tryout.passingScore ?? 'Belum tersedia'}</span>
}

export default TryoutPassingRules
