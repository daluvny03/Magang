export const getCategoryDescendantIds = (
  category,
) => {
  const ids = new Set()

  const collect = (node) => {
    node.children?.forEach((child) => {
      ids.add(child.id)
      collect(child)
    })
  }

  collect(category)

  return ids
}