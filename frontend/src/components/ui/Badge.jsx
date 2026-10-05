const tones = {
  gray: 'bg-gray-100 text-gray-700',
  primary: 'bg-primary-100 text-primary-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
}

function Badge({ tone = 'gray', children }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

export default Badge