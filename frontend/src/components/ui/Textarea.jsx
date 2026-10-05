function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:bg-gray-50 ${
        error
          ? 'border-red-400 focus:ring-red-200'
          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'
      } ${className}`}
      {...props}
    />
  )
}

export default Textarea