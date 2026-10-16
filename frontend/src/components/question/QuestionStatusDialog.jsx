import ConfirmDialog from '../ui/ConfirmDialog'

function QuestionStatusDialog({ isOpen, question, isSaving, onClose, onConfirm }) {
  const action = question?.isActive ? 'Deactivate' : 'Activate'

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isSaving}
      title={`${action} Question`}
      confirmLabel={action}
      variant={question?.isActive ? 'danger' : 'solid'}
      message={
        question?.isActive
          ? 'Apakah Anda yakin ingin menonaktifkan soal ini? Data dan relasi paket tetap tersimpan.'
          : 'Apakah Anda yakin ingin mengaktifkan kembali soal ini?'
      }
    />
  )
}

export default QuestionStatusDialog
