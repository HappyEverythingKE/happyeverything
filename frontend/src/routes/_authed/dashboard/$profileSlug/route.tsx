import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { fetchProfileQueryOptions } from '@/services/profile.api'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import NavHeader from '@/components/dashboard/nav-header'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'

export const Route = createFileRoute('/_authed/dashboard/$profileSlug')({
  beforeLoad: async ({ context, params }) => {
    const { profileSlug } = params
    try {
      await context.queryClient.ensureQueryData(
        fetchProfileQueryOptions(profileSlug),
      )
    } catch {
      console.error('Profile not found')
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: () => ({
    crumb: 'Home',
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { profileSlug } = Route.useParams()

  return (
    <SidebarProvider>
      <NavSidebar user={user} profileSlug={profileSlug} />
      <SidebarInset>
        <NavHeader user={user} />
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
