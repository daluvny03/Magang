function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      {/* Profile Header Skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-gray-100" />

          <div className="flex-1">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
            <div className="mt-2 h-4 w-52 animate-pulse rounded bg-gray-100" />
            <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Account Information Skeleton */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-100" />

        <div className="mt-6 space-y-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4"
            >
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-gray-100" />

              <div className="flex-1">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfileSkeleton