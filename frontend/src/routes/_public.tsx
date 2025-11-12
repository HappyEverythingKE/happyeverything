import { createFileRoute, Outlet } from '@tanstack/react-router'

import { Footer } from '@/components/marketing/footer'
import { Header } from '@/components/marketing/header'

export const Route = createFileRoute('/_public')({
  loader: async ({ context }) => {
    return { authState: context.authState }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { authState } = Route.useLoaderData()

  return (
    <div>
      <Header isAuthenticated={authState.isAuthenticated} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
