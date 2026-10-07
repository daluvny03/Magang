import {
  CalendarDays,
  CheckCircle2,
  Mail,
  User,
} from 'lucide-react'

function formatDate(date) {
  if (!date) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

function ProfileInformation({ profile }) {
  if (!profile) return null

  const displayName = profile.name || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-xl font-bold text-primary-600">
            {initial}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-gray-900">
              {displayName}
            </h2>

            <p className="mt-1 truncate text-sm text-gray-500">
              {profile.email}
            </p>

            <div className="mt-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  profile.isActive
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                <CheckCircle2 size={14} />

                {profile.isActive
                  ? 'Akun Aktif'
                  : 'Akun Tidak Aktif'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Account Information */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Informasi Akun
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Informasi dasar akun yang kamu gunakan.
          </p>
        </div>

        <div className="mt-6 divide-y divide-gray-100">
          <div className="flex gap-4 py-4 first:pt-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
              <User size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Nama
              </p>

              <p className="mt-1 break-words text-sm font-medium text-gray-900">
                {profile.name || '-'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
              <Mail size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Email
              </p>

              <p className="mt-1 break-all text-sm font-medium text-gray-900">
                {profile.email || '-'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 py-4 last:pb-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
              <CalendarDays size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Bergabung Sejak
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProfileInformation