function Select({ error, className = '', children, ...props }) {
  return (
    <select
      className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 disabled:bg-gray-50 ${
        error
          ? 'border-red-400 focus:ring-red-200'
          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export default Select