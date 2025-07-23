import { createFileRoute, Outlet } from '@tanstack/react-router'

import { profileListsQueryOptions } from '@/services/list.api'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import NavHeader from '@/components/dashboard/nav-header'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'

export const Route = createFileRoute('/_authed/dashboard/$profileSlug')({
  beforeLoad: async ({ context, params }) => {
    const queryClient = context.queryClient
    const user = context.user

    const profileSlug = params.profileSlug
    const profile = user.profiles.find(
      (profile) => profile.slug === profileSlug,
    )

    if (!profile) {
      throw new Error('Profile not found')
    }

    await queryClient.ensureQueryData(profileListsQueryOptions(profile.slug))

    return {
      user,
      profile,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { user, profile } = Route.useRouteContext()

  return (
    <>
      <SidebarProvider>
        <NavSidebar user={user} profile={profile} />
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
