import Badge from '../ui/Badge'
import Button from '../ui/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import Modal from '../ui/Modal'

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '-'

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-gray-50 py-3 last:border-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{children || '-'}</dd>
    </div>
  )
}

function UserDetailModal({ isOpen, response, isLoading, onClose }) {
  const user = response?.data ?? response

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User details"
      footer={
        <Button variant="soft" onClick={onClose}>
          Close
        </Button>
      }
    >
      {isLoading || !user ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-lg font-semibold text-white">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          <dl>
            <DetailRow label="Role">
              <Badge tone={user.role === 'admin' ? 'primary' : 'gray'}>
                {user.role}
              </Badge>
            </DetailRow>
            <DetailRow label="Joined">{formatDate(user.createdAt)}</DetailRow>
            <DetailRow label="Last updated">
              {formatDate(user.updatedAt)}
            </DetailRow>
            <DetailRow label="User ID">
              <span className="break-all font-mono text-xs">{user.id}</span>
            </DetailRow>
          </dl>
        </>
      )}
    </Modal>
  )
}

export default UserDetailModal