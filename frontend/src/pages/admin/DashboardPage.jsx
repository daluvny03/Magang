function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview sistem Simulasi CAT CPNS.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Questions
          </p>

          <p className="mt-2 text-2xl font-bold">
            -
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Categories
          </p>

          <p className="mt-2 text-2xl font-bold">
            -
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Tryout Packages
          </p>

          <p className="mt-2 text-2xl font-bold">
            -
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Users
          </p>

          <p className="mt-2 text-2xl font-bold">
            -
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage