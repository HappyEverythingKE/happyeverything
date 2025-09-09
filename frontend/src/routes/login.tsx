import { createFileRoute, redirect } from '@tanstack/react-router'

import { allProfilesQueryOptions } from '@/services/profile.api'

import { LoginForm } from '@/components/auth/login-form'
import { TwoColLayout } from '@/components/layout/two-col-layout'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    if (context.authState.isAuthenticated) {
      const profiles = await context.queryClient.ensureQueryData(
        allProfilesQueryOptions,
      )

      if (!profiles || profiles.length === 0) {
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
      <LoginForm />
    </TwoColLayout>
  )
}
