import ConfirmDialog from '../ui/ConfirmDialog'

function CategoryDeleteDialog({ category, isDeleting, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      isOpen={Boolean(category)}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isDeleting}
      title="Delete Category"
      confirmLabel="Delete"
      message={
        <>
          Are you sure you want to delete{' '}
          <strong className="text-gray-900">{category?.name}</strong>? This
          action cannot be undone.
        </>
      }
    />
  )
}

export default CategoryDeleteDialog