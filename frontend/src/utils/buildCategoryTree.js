export const buildCategoryTree = (categories = []) => {
  const nodeMap = new Map()

  categories.forEach((category) => {
    nodeMap.set(String(category.id), {
      ...category,
      children: [],
    })
  })

  const roots = []

  nodeMap.forEach((node) => {
    const parentId =
      node.parentId !== null &&
      node.parentId !== undefined
        ? String(node.parentId)
        : null

    if (!parentId) {
      roots.push(node)
      return
    }

    const parent = nodeMap.get(parentId)

    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}