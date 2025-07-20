import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { profileQueryOptions } from '@/services/auth.api'

import { useAuthSubscription } from '@/hooks/use-auth-subscription'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    const data = await context.queryClient.fetchQuery(profileQueryOptions)

    if (data.profiles.length === 0) {
      throw redirect({ to: '/onboarding' })
    }

    return {
      user: data,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  useAuthSubscription()
  return <Outlet />
}
