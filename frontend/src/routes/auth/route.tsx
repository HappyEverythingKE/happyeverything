import { createFileRoute, Outlet } from '@tanstack/react-router'

import { LogoHeader } from '@/components/layout/logo-header'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <LogoHeader />
      <main className="flex flex-1 items-center justify-center">
        <Outlet />
      </main>
    </>
  )
}
