import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { userQueryOptions } from '@/services/auth.api'

import { useAuthSubscription } from '@/hooks/use-auth-subscription'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    const user = await context.queryClient.ensureQueryData(userQueryOptions)
    if (user.name === '' || user.country === '') {
      throw redirect({ to: '/onboarding' })
    }

    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  useAuthSubscription()
  return <Outlet />
}
