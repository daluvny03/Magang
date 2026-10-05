function CheckItem({ label, meta, ...props }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-primary-50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary-500"
        {...props}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        {meta && (
          <span className="mt-0.5 block text-xs text-gray-500">{meta}</span>
        )}
      </span>
    </label>
  )
}

export default CheckItem