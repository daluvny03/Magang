import { LogOut, Menu } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

function Navbar({ onMenuClick }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-900">
            {user?.name || 'Admin'}
          </p>

          <p className="text-xs text-gray-500">
            {user?.role || 'admin'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">
            Logout
          </span>
        </button>
      </div>
    </header>
  )
}

export default Navbar