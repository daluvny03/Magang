import Surface from './Surface'

export function Skeleton({ className = '' }) {
  return (
    <div className={`rounded-lg bg-muted motion-safe:animate-pulse ${className}`} />
  )
}

export function StatSkeleton({ count = 4, className = '' }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Surface key={index} className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-7 w-24" />
            </div>

            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>

          <Skeleton className="mt-4 h-3 w-32" />
        </Surface>
      ))}
    </div>
  )
}

export function ChartSkeleton({ className = '' }) {
  return (
    <Surface className={`p-5 ${className}`}>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56" />
      <Skeleton className="mt-6 h-56 w-full rounded-2xl" />
    </Surface>
  )
}