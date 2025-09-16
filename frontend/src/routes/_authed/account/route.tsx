import { createFileRoute, Outlet } from '@tanstack/react-router'

import { accountQueryOptions } from '@/services/account.api'

export const Route = createFileRoute('/_authed/account')({
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(accountQueryOptions)
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main>
      <Outlet />
    </main>
  )
}
