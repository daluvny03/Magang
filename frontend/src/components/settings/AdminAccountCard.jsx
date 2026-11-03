import { BadgeCheck, Mail, ShieldCheck } from 'lucide-react'

function AdminAccountCard({ profile }) {
  const displayName = profile.name || 'Admin'
  const initial = displayName.charAt(0).toUpperCase()
  const isVerified = Boolean(profile.emailVerifiedAt)

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-xl font-bold text-primary-700">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
            Akun administrator
          </p>
          <h2 className="mt-1 truncate text-xl font-bold text-gray-900">
            {displayName}
          </h2>
          <p className="mt-1 flex items-center gap-2 break-all text-sm text-gray-500">
            <Mail size={16} aria-hidden="true" />
            {profile.email || '-'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <BadgeCheck size={15} aria-hidden="true" />
            {profile.isActive ? 'Akun aktif' : 'Akun tidak aktif'}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isVerified ? 'bg-primary-50 text-primary-700' : 'bg-amber-50 text-amber-700'}`}>
            <ShieldCheck size={15} aria-hidden="true" />
            {isVerified ? 'Email terverifikasi' : 'Email belum terverifikasi'}
          </span>
        </div>
      </div>
    </section>
  )
}

export default AdminAccountCard
