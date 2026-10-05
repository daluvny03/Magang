const variants = {
  solid: 'bg-primary-500 text-white hover:bg-primary-600',
  soft: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
  outline: 'border border-primary-500 text-primary-600 hover:bg-primary-50',
  ghost: 'text-gray-600 hover:bg-primary-50 hover:text-primary-700',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
}

function Button({
  variant = 'solid',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

export default Button