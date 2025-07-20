import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import NavHeader from '@/components/dashboard/nav-header'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'

export const Route = createFileRoute('/_authed/dashboard')({
  loader: async ({ context }) => {
    return context.user
  },
  component: RouteComponent,
})

function RouteComponent() {
  const user = Route.useLoaderData()

  return (
    <>
      <SidebarProvider>
        <NavSidebar user={user} />
        <SidebarInset>
          <NavHeader user={user} />
          <main className="flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
