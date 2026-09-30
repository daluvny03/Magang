export const flattenCategoryTree = (
  categories = [],
) => {
  const result = []

  const traverse = (nodes) => {
    nodes.forEach((node) => {
      result.push(node)

      if (node.children?.length) {
        traverse(node.children)
      }
    })
  }

  traverse(categories)

  return result
}