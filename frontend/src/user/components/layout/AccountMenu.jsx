import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, CreditCard, LogOut, Sparkles, User } from 'lucide-react'

import { useAuthStore } from '@/stores/authStore'

import LogoutConfirmModal from './LogoutConfirmModal'

const MENU_LINKS = [
  { label: 'Profil Saya', to: '/user/profile', icon: User },
  { label: 'Paket Subscription', to: '/user/subscription', icon: Sparkles },
  { label: 'Riwayat Pembayaran', to: '/user/payments', icon: CreditCard },
]

const itemClass =
  'focus-ring flex min-h-[46px] w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] font-semibold transition-colors'

function Avatar({ initial, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary-700 font-bold text-white ${className}`}
    >
      {initial}
    </span>
  )
}

function AccountMenu() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const panelId = useId()

  const displayName = user?.name || 'Peserta'
  const initial = displayName.charAt(0).toUpperCase()

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleBlur = (event) => {
    // Some browsers report null when a pointer moves focus to a menu item.
    // Let the outside-pointer and Escape handlers close the menu in that case
    // so the clicked action is not unmounted before its click handler runs.
    if (
      event.relatedTarget &&
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setOpen(false)
    }
  }

  const handleConfirmLogout = () => {
    setConfirmOpen(false)
    logout()
  }

  const openLogoutConfirmation = () => {
    setConfirmOpen(true)
    setOpen(false)
  }

  return (
    <>
      <div ref={containerRef} onBlur={handleBlur} className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`Menu akun ${displayName}`}
          className="focus-ring flex h-11 items-center gap-2 rounded-xl border border-border bg-card/80 p-1 pr-2.5 transition-colors hover:bg-muted"
        >
          <Avatar initial={initial} className="h-9 w-9 text-[14px]" />

          <span className="hidden max-w-[140px] truncate text-[14px] font-semibold text-foreground sm:block">
            {displayName}
          </span>

          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`text-muted-foreground transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <div
            id={panelId}
            className="absolute right-0 top-full z-40 mt-2 w-[280px] rounded-2xl border border-border bg-card p-2 shadow-xl"
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar initial={initial} className="h-11 w-11 text-[16px]" />

              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-foreground">
                  {displayName}
                </p>

                {user?.email && (
                  <p className="truncate text-[13px] text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="my-1 h-px bg-border" />

            {MENU_LINKS.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`${itemClass} text-foreground hover:bg-muted`}
              >
                <Icon size={18} aria-hidden="true" className="text-muted-foreground" />
                {label}
              </Link>
            ))}

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              onClick={openLogoutConfirmation}
              className={`${itemClass} text-destructive hover:bg-destructive/10`}
            >
              <LogOut size={18} aria-hidden="true" />
              Logout
            </button>
          </div>
        )}
      </div>

      <LogoutConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  )
}

export default AccountMenu
