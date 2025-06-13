import { createFileRoute } from '@tanstack/react-router'

import { LoginForm } from '@/components/auth/login-form'
import { TwoColLayout } from '@/components/layout/two-col-layout'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <TwoColLayout>
      <LoginForm />
    </TwoColLayout>
  )
}
