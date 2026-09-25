import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Tags,
  FileQuestion,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Categories',
    path: '/admin/categories',
    icon: Tags,
  },
  {
    label: 'Questions',
    path: '/admin/questions',
    icon: FileQuestion,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
  },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-gray-950 text-white transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <span className="text-lg font-bold">
            CAT CPNS
          </span>

          <button
            type="button"
            className="lg:hidden"
            onClick={onClose}
          >
            <Menu size={22} />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar