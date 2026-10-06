const tones = {
  primary: 'border-primary-200 bg-primary-50 text-primary-700',
  green: 'border-green-200 bg-green-50 text-green-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  yellow: 'border-yellow-200 bg-yellow-50 text-yellow-800',
}

function Alert({ tone = 'primary', className = '', children }) {
  return (
    <div className={`rounded-lg border p-3 text-sm ${tones[tone]} ${className}`}>
      {children}
    </div>
  )
}

export default Alert