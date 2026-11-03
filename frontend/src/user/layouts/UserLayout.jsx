import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'

const STORAGE_KEY = 'halobakat:user-sidebar-collapsed'

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function UserLayout() {
  const { pathname } = useLocation()

  // Laptop: sidebar lebar atau ciut. Pilihan diingat di peramban.
  const [collapsed, setCollapsed] = useState(readCollapsed)

  // HP: panel dianggap terbuka hanya selama masih di halaman tempat ia dibuka,
  // jadi berpindah halaman (termasuk tombol Back) otomatis menutupnya.
  const [drawerPath, setDrawerPath] = useState(null)
  const mobileOpen = drawerPath === pathname

  const closeMobile = useCallback(() => setDrawerPath(null), [])
  const toggleMobile = useCallback(() => {
    setDrawerPath((currentPath) =>
      currentPath === pathname ? null : pathname
    )
  }, [pathname])

  const toggleCollapsed = () => {
    const next = !collapsed

    setCollapsed(next)

    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    } catch {
      /* penyimpanan tidak tersedia, abaikan */
    }
  }

  // Layar diperlebar ke laptop saat panel terbuka: tutup panelnya
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')

    const handleChange = (event) => {
      if (event.matches) setDrawerPath(null)
    }

    query.addEventListener('change', handleChange)

    return () => query.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="relative isolate min-h-screen bg-background font-user text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80] focus:rounded-xl focus:bg-primary-700 focus:px-4 focus:py-2.5 focus:text-[14px] focus:font-semibold focus:text-white"
      >
        Lewati ke konten utama
      </a>

      <div
        aria-hidden="true"
        className="mesh-bg pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px]"
      />

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />

      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-out motion-reduce:transition-none ${
          collapsed ? 'lg:pl-[88px]' : 'lg:pl-[272px]'
        }`}
      >
        <Navbar
          collapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
          onOpenMobile={toggleMobile}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 pb-16 pt-6 outline-none sm:px-6 lg:px-8"
        >
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserLayout
