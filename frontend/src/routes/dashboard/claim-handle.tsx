import { createFileRoute } from '@tanstack/react-router'

import { URLHandleForm } from '@/components/dashboard/urlHandle-form'
import { LogoHeader } from '@/components/layout/logo-header'

export const Route = createFileRoute('/dashboard/claim-handle')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      {/* <LogoHeader /> */}
      <URLHandleForm />
    </>
  )
}
