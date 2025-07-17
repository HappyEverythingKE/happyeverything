import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { profileQueryOptions } from '@/services/auth.api'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    // fetch and cache the current user's profile
    const userRes = await context.queryClient.fetchQuery(profileQueryOptions)
    if (!userRes.success) {
      throw new Error(userRes.error)
    }
    const user = userRes.data
    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
