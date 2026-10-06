import ConfirmDialog from '../ui/ConfirmDialog'

function QuestionDeleteDialog({ isOpen, question, isDeleting, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isDeleting}
      title="Delete Question"
      message={
        <>
          <span className="mb-3 block">This action cannot be undone.</span>
          <span className="line-clamp-3 block rounded-lg bg-gray-50 p-3 text-gray-700">
            {question?.questionText || 'Selected question'}
          </span>
        </>
      }
    />
  )
}

export default QuestionDeleteDialog