import { Loader2Icon } from 'lucide-react'

export function PendingComponent() {
  return (
    <div className="mx-auto mt-8 flex min-h-svh flex-col items-center justify-center">
      <Loader2Icon className="animate-spin" />
      <p className="text-muted-foreground mt-2 text-sm">Loading...</p>
    </div>
  )
}
