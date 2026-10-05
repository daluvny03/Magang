function LoadingSpinner({ size = 32, text }) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 ${
        text ? 'py-12' : ''
      }`}
    >
      <div
        style={{ width: size, height: size }}
        className="animate-spin rounded-full border-2 border-primary-100 border-t-primary-500"
      />
      {text && <p className="text-xs text-gray-500">{text}</p>}
    </div>
  )
}

export default LoadingSpinner