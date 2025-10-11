import { createFileRoute, redirect } from '@tanstack/react-router'

import { userQueryOptions } from '@/services/auth.api'

import { LoginPage } from '@/components/auth/login-page'
import { TwoColLayout } from '@/components/layout/two-col-layout'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    if (context.authState.isAuthenticated) {
      const user = await context.queryClient.ensureQueryData(userQueryOptions)

      if (user.name === '' || user.country === '') {
        throw redirect({ to: '/onboarding' })
      }

      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <TwoColLayout>
      <LoginPage />
    </TwoColLayout>
  )
}
