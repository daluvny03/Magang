import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  Database,
  FileQuestion,
  LayoutDashboard,
  Package,
  Settings,
  Tags,
  Users,
  X,
} from 'lucide-react'

const navigation = [
  {
    section: 'Aplikasi',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      {
        label: 'Master',
        icon: Database,
        children: [
          { label: 'Categories', path: '/admin/categories', icon: Tags },
          { label: 'Questions', path: '/admin/questions', icon: FileQuestion },
          { label: 'Tryout Packages', path: '/admin/tryout-packages', icon: Package },
          { label: 'Users', path: '/admin/users', icon: Users },
        ],
      },
    ],
  },
  {
    section: 'Pengaturan',
    items: [{ label: 'Settings', path: '/admin/settings', icon: Settings }],
  },
]

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition'

function NavGroup({ item, onNavigate }) {
  const { pathname } = useLocation()
  const hasActiveChild = item.children.some((c) => pathname.startsWith(c.path))
  const [open, setOpen] = useState(hasActiveChild)
  const Icon = item.icon

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`${linkBase} w-full ${
          open || hasActiveChild
            ? 'bg-primary-500 text-white'
            : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
        }`}
      >
        <Icon size={18} />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-1 pl-3">
          {item.children.map((child) => {
            const ChildIcon = child.icon
            return (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `${linkBase} py-2 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                  }`
                }
              >
                <ChildIcon size={17} />
                {child.label}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Sidebar({ isOpen, onClose }) {
  // Di layar kecil, tutup sidebar setelah pindah halaman
  const handleNavigate = () => {
    if (window.innerWidth < 1024) onClose()
  }

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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-gray-100 bg-white transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <span className="text-xl font-bold text-primary-500">
            CAT CPNS
          </span>

          <button
            type="button"
            aria-label="Close sidebar"
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          {navigation.map((group) => (
            <div key={group.section}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-900">
                {group.section}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  if (item.children) {
                    return (
                      <NavGroup
                        key={item.label}
                        item={item}
                        onNavigate={handleNavigate}
                      />
                    )
                  }

                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleNavigate}
                      className={({ isActive }) =>
                        `${linkBase} ${
                          isActive
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                        }`
                      }
                    >
                      <Icon size={18} />
                      {item.label}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar