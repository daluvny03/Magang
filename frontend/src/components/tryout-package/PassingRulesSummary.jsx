const modeLabels = {
  none: 'Tanpa evaluasi kelulusan',
  total: 'Berdasarkan skor total',
  category: 'Berdasarkan kategori',
}

function PassingRulesSummary({ packageData }) {
  const { passingMode, passingScore, passingGrades } = packageData

  return (
    <div className="space-y-1 text-sm text-gray-900">
      <p className="font-medium">{modeLabels[passingMode] || 'Mode belum tersedia'}</p>
      {passingMode === 'total' && (
        <p>Batas skor: {passingScore ?? '—'}</p>
      )}
      {passingMode === 'category' && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {['twk', 'tiu', 'tkp']
            .filter((slug) => passingGrades?.[slug] != null)
            .map((slug) => <span key={slug}>{slug.toUpperCase()}: {passingGrades[slug]}</span>)}
          {!Object.values(passingGrades || {}).some((value) => value != null) && (
            <span>Batas kategori belum tersedia</span>
          )}
        </div>
      )}
    </div>
  )
}

export default PassingRulesSummary
