import { LogOut, Menu } from 'lucide-react'

import { useAuthStore } from '../../../stores/authStore'

function Navbar({ onMenuClick }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const displayName = user?.name || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white/90 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-primary-50 hover:text-primary-700"
        >
          <Menu size={22} />
        </button>

        <span className="text-lg font-bold text-primary-600">
          Halobakat
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-900">
            {displayName}
          </p>

          <p className="text-xs capitalize text-gray-500">
            {user?.role || 'user'}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
          {initial}
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-primary-50 hover:text-primary-700"
        >
          <LogOut size={18} />

          <span className="hidden md:inline">
            Logout
          </span>
        </button>
      </div>
    </header>
  )
}

export default Navbar