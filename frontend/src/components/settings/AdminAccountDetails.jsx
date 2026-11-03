import { CalendarDays, Clock3, Shield } from 'lucide-react'

const formatAccountDate = (value, withTime = false) => {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value))
}

function AdminAccountDetails({ profile }) {
  const details = [
    { label: 'Peran akun', value: 'Administrator', icon: Shield },
    { label: 'Bergabung sejak', value: formatAccountDate(profile.createdAt), icon: CalendarDays },
    { label: 'Login terakhir', value: formatAccountDate(profile.lastLoginAt, true), icon: Clock3 },
  ]

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Informasi akun</h2>
        <p className="mt-1 text-sm text-gray-500">Detail akun yang digunakan untuk mengelola aplikasi.</p>
      </div>

      <dl className="mt-6 divide-y divide-gray-100">
        {details.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
              <Icon size={18} aria-hidden="true" />
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default AdminAccountDetails
