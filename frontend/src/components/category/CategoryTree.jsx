import CategoryTreeItem from './CategoryTreeItem'

function CategoryTree({ categories, search, onEdit, onDelete, onAddChild }) {
  return (
    <div className="divide-y divide-gray-50">
      {categories.map((category) => (
        <CategoryTreeItem
          key={category.id}
          category={category}
          level={0}
          search={search}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  )
}

export default CategoryTree