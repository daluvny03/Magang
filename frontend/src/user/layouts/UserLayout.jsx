import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'

function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1024
  )

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={`transition-[padding] duration-200 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        <Navbar
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default UserLayout