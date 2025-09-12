import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { listsByProfileQueryOptions } from '@/services/list.api'
import { allProfilesQueryOptions } from '@/services/profile.api'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import NavHeader from '@/components/dashboard/nav-header'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'

export const Route = createFileRoute('/_authed/dashboard/$profileSlug')({
  beforeLoad: async ({ context, params }) => {
    const queryClient = context.queryClient
    const profileSlug = params.profileSlug

    const allProfiles = await queryClient.ensureQueryData(
      allProfilesQueryOptions,
    )

    const selectedProfile = allProfiles.find(
      (profile) => profile.slug === profileSlug,
    )

    if (!selectedProfile) {
      console.error('Profile not found')
      throw redirect({ to: '/dashboard' })
    }

    // hydrate lists for this profile if they exist
    await queryClient.ensureQueryData(listsByProfileQueryOptions(profileSlug))

    return { selectedProfile, allProfiles }
  },
  loader: () => ({
    crumb: 'Home',
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { user, selectedProfile, allProfiles } = Route.useRouteContext()

  return (
    <SidebarProvider>
      <NavSidebar
        user={user}
        selectedProfile={selectedProfile}
        allProfiles={allProfiles}
      />
      <SidebarInset>
        <NavHeader user={user} />
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
