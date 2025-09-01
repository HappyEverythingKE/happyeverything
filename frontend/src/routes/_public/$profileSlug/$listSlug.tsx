import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/$profileSlug/$listSlug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello &quot;/_public/$profileSlug/$listSlug&quot;!</div>
}
