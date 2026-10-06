import { ShieldAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'

function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500">
          <ShieldAlert size={30} />
        </div>

        <h1 className="mt-6 text-6xl font-bold text-primary-500">403</h1>

        <p className="mt-3 text-base font-semibold text-gray-900">
          Akses ditolak
        </p>
        <p className="mt-1 text-sm text-gray-500">
          You do not have permission to access this page.
        </p>

        <div className="mt-8 flex gap-2">
          <Button variant="soft" onClick={() => navigate(-1)}>
            Kembali
          </Button>
          <Button onClick={() => navigate('/admin/dashboard', { replace: true })}>
            Ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ForbiddenPage