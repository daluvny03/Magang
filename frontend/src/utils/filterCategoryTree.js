export const filterCategoryTree = (
  categories = [],
  search = '',
) => {
  const keyword = search.trim().toLowerCase()

  if (!keyword) {
    return categories
  }

  const filterNodes = (nodes) => {
    return nodes.reduce((result, node) => {
      const matches =
        node.name.toLowerCase().includes(keyword)

      const filteredChildren = filterNodes(
        node.children || [],
      )

      if (matches || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        })
      }

      return result
    }, [])
  }

  return filterNodes(categories)
}