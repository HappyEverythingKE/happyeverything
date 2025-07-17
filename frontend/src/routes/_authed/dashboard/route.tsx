import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import NavHeader from '@/components/dashboard/nav-header'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'

export const Route = createFileRoute('/_authed/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()

  return (
    <>
      <SidebarProvider>
        <NavSidebar user={user} />
        <SidebarInset>
          <NavHeader user={user} />
          <main>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
