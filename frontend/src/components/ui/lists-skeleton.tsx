import { Skeleton } from '@/components/ui/skeleton'

function ListsSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-9">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-lg border p-6">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

export { ListsSkeleton }
