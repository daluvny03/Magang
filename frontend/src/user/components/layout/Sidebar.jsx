import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, Sparkles, X } from 'lucide-react'

import { NAV_GROUPS, isNavActive } from '@/user/constants/navigation'

function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { pathname } = useLocation()
  const closeButtonRef = useRef(null)

  // Panel HP terbuka: fokus ke tombol tutup, Esc menutup, scroll halaman dikunci
  useEffect(() => {
    if (!mobileOpen) return undefined

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseMobile()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [mobileOpen, onCloseMobile])

  const hideWhenCollapsed = collapsed ? 'lg:hidden' : ''

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden={!mobileOpen}
        aria-label="Tutup menu"
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-border bg-card transition-[width,transform,visibility] duration-300 ease-out motion-reduce:transition-none ${
          collapsed ? 'lg:w-[88px]' : 'lg:w-[272px]'
        } ${
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full max-lg:invisible lg:translate-x-0'
        }`}
      >
        <div
          className={`flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 ${
            collapsed ? 'lg:justify-center lg:px-0' : ''
          }`}
        >
          <Link
            to="/user/dashboard"
            onClick={onCloseMobile}
            aria-label="Halobakat, ke beranda"
            className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-xl lg:flex-none"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-white">
              <GraduationCap size={22} aria-hidden="true" />
            </span>

            <span className={`min-w-0 ${hideWhenCollapsed}`}>
              <span className="block truncate text-[17px] font-bold leading-tight text-primary-700">
                Halobakat
              </span>

              <span className="block truncate text-[12px] text-muted-foreground">
                Latihan Tryout
              </span>
            </span>
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
            className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Navigasi pengguna"
          className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-4"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.title} role="group" aria-label={group.title}>
              <p
                className={`mb-2 px-3.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground ${hideWhenCollapsed}`}
              >
                {group.title}
              </p>

              {collapsed && (
                <div
                  aria-hidden="true"
                  className="mx-auto mb-2 hidden h-px w-8 bg-border lg:block"
                />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const active = isNavActive(item, pathname)

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      aria-current={active ? 'page' : undefined}
                      title={
                        collapsed
                          ? `${item.label}${item.comingSoon ? ' (segera)' : ''}`
                          : undefined
                      }
                      className={`focus-ring relative flex min-h-[46px] items-center gap-3 rounded-xl px-3.5 text-[14px] font-semibold transition-colors ${
                        collapsed ? 'lg:justify-center lg:px-0' : ''
                      } ${
                        active
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-700"
                        />
                      )}

                      <Icon size={20} aria-hidden="true" className="shrink-0" />

                      <span
                        className={`min-w-0 flex-1 truncate ${
                          collapsed ? 'lg:sr-only' : ''
                        }`}
                      >
                        {item.label}
                      </span>

                      {item.comingSoon && (
                        <span
                          className={`shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[12px] font-semibold text-amber-800 ${hideWhenCollapsed}`}
                        >
                          Segera
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border p-2.5">
          <div className={`rounded-xl bg-primary-50 p-3 ${hideWhenCollapsed}`}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} aria-hidden="true" className="shrink-0 text-primary-700" />

              <p className="text-[13px] font-bold leading-5 text-foreground">
                Paket Subscription
              </p>
            </div>

            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              Buka pembahasan lengkap dan analisis waktu per soal.
            </p>

            <Link
              to="/user/subscription"
              onClick={onCloseMobile}
              className="focus-ring mt-2.5 flex h-9 w-full items-center justify-center rounded-lg bg-primary-700 text-[12px] font-semibold text-white transition-colors hover:bg-primary-700/90"
            >
              Lihat Paket
            </Link>
          </div>

          {collapsed && (
            <Link
              to="/user/subscription"
              aria-label="Paket Subscription"
              title="Paket Subscription"
              className="focus-ring mx-auto hidden h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors hover:bg-primary-100 lg:flex"
            >
              <Sparkles size={20} aria-hidden="true" />
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
