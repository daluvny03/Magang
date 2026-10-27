import {
  ClipboardList,
  History,
  Home,
  User,
  X,
  GraduationCap,
  Trophy,
  ChartNoAxesCombined,
  Crown,
  ReceiptText,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

const navigationGroups = [
  {
    title: 'MENU UTAMA',
    items: [
      {
        label: 'Beranda',
        path: '/user/dashboard',
        icon: Home,
      },
      {
        label: 'Kumpulan Tryout',
        path: '/user/tryouts',
        icon: ClipboardList,
      },
      {
        label: 'Riwayat Tryout',
        path: '/user/history',
        icon: History,
      },
      {
        label: 'Statistik Performa',
        path: '/user/statistics',
        icon: ChartNoAxesCombined,
      },
      {
        label: 'Leaderboard',
        path: '/user/leaderboard',
        icon: Trophy,
        comingSoon: true,
      },
    ],
  },
  {
    title: 'SUBSCRIPTION',
    items: [
      {
        label: 'Paket Subscription',
        path: '/user/subscription',
        icon: Crown,
      },
      {
        label: 'Riwayat Pembayaran',
        path: '/user/payments',
        icon: ReceiptText,
      },
    ],
  },
  {
    title: 'AKUN',
    items: [
      {
        label: 'Profil Saya',
        path: '/user/profile',
        icon: User,
      },
    ],
  },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col',
          'border-r border-gray-100 bg-white',
          'transition-all duration-200',
          'w-64',
          isOpen
            ? 'translate-x-0 lg:w-64'
            : '-translate-x-full lg:w-20 lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div
          className={`flex h-16 items-center border-b border-gray-100 px-4 ${isOpen
            ? 'justify-between'
            : 'justify-center'
            }`}
        >
          <NavLink
            to="/user/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
            aria-label="Halobakat Dashboard"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
              <GraduationCap size={23} />
            </div>

            {isOpen && (
              <span className="truncate text-lg font-bold text-primary-600">
                Halobakat
              </span>
            )}
          </NavLink>

          {isOpen && (
            <button
              type="button"
              aria-label="Tutup sidebar"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          aria-label="Navigasi pengguna"
          className="flex-1 space-y-5 overflow-y-auto p-3"
        >
          {navigationGroups.map((group) => (
            <div key={group.title}>
              {isOpen ? (
                <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {group.title}
                </p>
              ) : (
                <div
                  className="mx-auto mb-3 h-px w-8 bg-gray-200"
                  aria-hidden="true"
                />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon

                  const baseClass = [
                    'flex min-h-11 items-center rounded-xl py-3',
                    'text-sm font-medium transition',
                    isOpen
                      ? 'gap-3 px-4'
                      : 'justify-center px-2',
                  ].join(' ')

                  if (item.disabled) {
                    return (
                      <div
                        key={item.path}
                        title={item.label}
                        aria-disabled="true"
                        className={`${baseClass} cursor-not-allowed text-gray-400`}
                      >
                        <Icon size={20} className="shrink-0" />
                        {isOpen && (
                          <>
                            <span className="min-w-0 flex-1 truncate">
                              {item.label}
                            </span>

                            {item.comingSoon && (
                              <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                Segera
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )
                  }

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={!isOpen ? item.label : undefined}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose()
                        }
                      }}
                      className={({ isActive }) =>
                        [
                          baseClass,
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        ].join(' ')
                      }
                    >
                      <Icon size={20} className="shrink-0" />

                      {isOpen && (
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                      )}
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
