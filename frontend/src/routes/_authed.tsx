import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { userQueryOptions } from '@/services/auth.api'
import { allProfilesQueryOptions } from '@/services/profile.api'

import { useAuthSubscription } from '@/hooks/use-auth-subscription'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    const user = await context.queryClient.fetchQuery(userQueryOptions)
    const profiles = await context.queryClient.fetchQuery(
      allProfilesQueryOptions,
    )

    if (profiles.length === 0) {
      throw redirect({ to: '/onboarding' })
    }

    return { user, profiles }
  },
  component: RouteComponent,
})

function RouteComponent() {
  useAuthSubscription()
  return <Outlet />
}
