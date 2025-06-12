import { createFileRoute } from '@tanstack/react-router'

import { SignupForm } from '@/components/auth/signup-form'
import { TwoColLayout } from '@/components/layout/two-col-layout'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <TwoColLayout>
      <SignupForm />
    </TwoColLayout>
  )
}
