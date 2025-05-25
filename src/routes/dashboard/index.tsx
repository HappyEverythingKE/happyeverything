import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grid grid-cols-1 gap-6 px-8 py-4 lg:grid-cols-3 lg:gap-9">
      <h4>Let&apos;s get started</h4>
    </div>
  )
}
