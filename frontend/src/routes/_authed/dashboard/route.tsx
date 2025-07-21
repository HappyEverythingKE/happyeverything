import { createFileRoute, Outlet } from '@tanstack/react-router'

import { listQueryOptions } from '@/services/list.api'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import NavHeader from '@/components/dashboard/nav-header'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'

export const Route = createFileRoute('/_authed/dashboard')({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient
    const user = context.user

    const profile = user.profiles[0]
    const profileId = profile?.id

    // prefetch lists data
    const lists = await queryClient.ensureQueryData(listQueryOptions(profileId))

    return {
      user,
      profileId,
      lists,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user, profileId, lists } = Route.useRouteContext()

  return (
    <>
      <SidebarProvider>
        <NavSidebar user={user} lists={lists} profileId={profileId} />
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
