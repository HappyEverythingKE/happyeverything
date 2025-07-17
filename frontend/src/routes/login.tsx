import { createFileRoute, redirect } from '@tanstack/react-router'

import { LoginForm } from '@/components/auth/login-form'
import { TwoColLayout } from '@/components/layout/two-col-layout'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (context.authState.isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function RouteComponent() {
  return (
    <TwoColLayout>
      <LoginForm />
    </TwoColLayout>
  )
}
