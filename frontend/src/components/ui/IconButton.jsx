function IconButton({ label, className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700 ${className}`}
      {...props}
    />
  )
}

export default IconButton