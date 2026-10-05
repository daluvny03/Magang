export function filterCategoriesByPackageSelection(categories, selectedIds) {
  const selected = new Set((selectedIds || []).map(String))
  if (!selected.size) return []

  const byId = new Map(
    (categories || []).map((category) => [String(category.id), category])
  )

  return (categories || []).filter((category) => {
    let current = category

    while (current) {
      if (selected.has(String(current.id))) return true

      const parentId = current.parentId ?? current.parent_id
      current = parentId != null ? byId.get(String(parentId)) : null
    }

    return false
  })
}