function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">
          403
        </h1>

        <p className="mt-4 text-gray-600">
          You do not have permission to access this page.
        </p>
      </div>
    </div>
  )
}

export default ForbiddenPage