import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function OnboardingSkeleton() {
  return (
    <Card className="flex max-w-[90vw] flex-1 md:w-full md:max-w-lg">
      <CardHeader className="gap-3">
        <div className="flex-1">
          <CardTitle className="text-lg">
            <Skeleton className="h-6 w-52" />
          </CardTitle>
          <CardDescription className="text-balance text-base">
            <Skeleton className="mt-2 h-4 w-72" />
          </CardDescription>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="py-6">
        {/* Field group */}
        <div className="grid gap-6">
          {/* Name field */}
          <div className="grid gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>

          {/* Country field */}
          <div className="grid gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>

        {/* Submit button */}
        <Skeleton className="mt-4 h-9 w-full" />
      </CardContent>
    </Card>
  )
}

export default OnboardingSkeleton
