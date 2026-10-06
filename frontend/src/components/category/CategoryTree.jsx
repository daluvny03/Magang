import CategoryCard from './CategoryCard'

function CategoryTree({ categories, search, onEdit, onDelete, onAddChild }) {
  return (
    <div className="grid items-start gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
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