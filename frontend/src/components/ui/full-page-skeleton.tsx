import { Skeleton } from '@/components/ui/skeleton'

interface FullPageSkeletonProps {
  variant?: 'profile' | 'dashboard' | 'list' | 'custom'
  customContent?: React.ReactNode
}

export function FullPageSkeleton({
  variant = 'dashboard',
  customContent,
}: FullPageSkeletonProps) {
  if (customContent) {
    return <div className="mx-auto min-h-svh px-[5%] pt-8">{customContent}</div>
  }

  if (variant === 'profile') {
    return (
      <div className="mx-auto min-h-svh px-[5%] pt-8">
        {/* Profile Header Skeleton */}
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto h-20 w-20 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-8 w-48" />
          <Skeleton className="mx-auto mt-2 h-4 w-32" />
          <Skeleton className="mx-auto mt-2 h-4 w-24" />
        </div>

        {/* Lists Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 shadow-sm">
              <Skeleton className="mb-4 h-32 w-full rounded" />
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-3 h-4 w-1/2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="mx-auto min-h-svh px-8 pt-8">
        {/* List Header Skeleton */}
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto h-32 w-full max-w-2xl rounded-lg" />
          <div className="mt-4 flex justify-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        {/* List Items Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 shadow-sm">
              <Skeleton className="mb-3 h-6 w-3/4" />
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default dashboard variant
  return (
    <div className="mx-auto min-h-svh px-8 pt-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 shadow-sm">
            <Skeleton className="mb-4 h-6 w-3/4" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-3 h-4 w-2/3" />
            <Skeleton className="h-9 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
