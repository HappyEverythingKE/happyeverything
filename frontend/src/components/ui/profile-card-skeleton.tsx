import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileCardSkeleton() {
  return (
    <Card className="flex w-full max-w-xl overflow-hidden">
      <CardHeader className="gap-3">
        <CardTitle className="text-lg">
          <Skeleton className="h-6 w-40" />
        </CardTitle>
        <CardDescription className="text-balance text-base">
          <Skeleton className="mt-2 h-4 w-72" />
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full py-6">
        <div className="flex flex-wrap justify-center gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="group h-full w-60 cursor-pointer overflow-hidden rounded-lg border p-4 transition-all"
            >
              <div className="flex min-w-0 flex-col items-center justify-between space-y-3 pb-1">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileCardSkeleton
