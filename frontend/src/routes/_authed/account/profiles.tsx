import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/account/profiles')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/account/profiles"!</div>
}
