import { Skeleton } from '@/components/ui/skeleton'

export function ActivityLogSkeleton() {
  return (
    <div className="bg-card border-border max-h-[50vh] overflow-y-auto rounded-lg border p-4">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            {/* Icon skeleton */}
            <div className="mt-0.5 flex-shrink-0">
              <Skeleton className="h-4 w-4" />
            </div>
            {/* Content skeleton */}
            <div className="min-w-0 flex-1">
              <div className="space-y-2">
                {/* Main text skeleton */}
                <Skeleton className="h-4 w-3/4" />
                {/* Timestamp skeleton */}
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
