import { useLocation } from 'react-router-dom'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { getRouteInfo } from '@/user/constants/navigation'

import AccountMenu from './AccountMenu'

const iconButton =
  'focus-ring h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'

function Navbar({ collapsed, onToggleSidebar, onOpenMobile }) {
  const { pathname } = useLocation()
  const { title, parent } = getRouteInfo(pathname)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-2 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Buka menu"
          className={`${iconButton} flex lg:hidden`}
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Perluas menu' : 'Ciutkan menu'}
          aria-expanded={!collapsed}
          className={`${iconButton} hidden lg:flex`}
        >
          {collapsed ? (
            <PanelLeftOpen size={22} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={22} aria-hidden="true" />
          )}
        </button>

        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold leading-tight text-foreground">
            {title}
          </p>

          <p className="hidden truncate text-[13px] text-muted-foreground sm:block">
            {parent ? `${parent} / ${title}` : 'Halobakat · Latihan Tryout'}
          </p>
        </div>

        <div className="ml-auto">
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}

export default Navbar