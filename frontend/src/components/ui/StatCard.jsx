const tones = {
  gray: 'border-gray-200 text-gray-900',
  green: 'border-green-200 bg-green-50 text-green-700',
  red: 'border-red-200 bg-red-50 text-red-700',
}

function StatCard({ label, value, tone = 'gray' }) {
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold">{value}</p>
    </div>
  )
}

export default StatCard