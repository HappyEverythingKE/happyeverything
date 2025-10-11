import { BrandLoader } from '@/components/ui/brand-loader'

export function PendingComponent() {
  return (
    <div className="mx-auto mt-8 flex min-h-svh flex-col items-center justify-center gap-4">
      <BrandLoader size={64} />
      <p className="text-primary animate-pulse text-sm font-medium [animation-duration:3s]">
        Happiness Loading...
      </p>
    </div>
  )
}
