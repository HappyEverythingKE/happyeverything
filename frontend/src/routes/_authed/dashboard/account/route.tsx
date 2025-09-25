import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { accountQueryOptions } from '@/services/account.api'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import NavHeader from '@/components/dashboard/nav-header'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'

export const Route = createFileRoute('/_authed/dashboard/account')({
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(accountQueryOptions)
  },
  loader: () => ({
    crumb: 'Account',
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { data: account } = useSuspenseQuery(accountQueryOptions)

  return (
    <SidebarProvider>
      <NavSidebar user={account} allProfiles={[]} />
      <SidebarInset>
        <NavHeader user={account} />
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
