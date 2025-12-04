import { createFileRoute, Outlet } from '@tanstack/react-router'

import { Footer } from '@/components/marketing/footer'
import { Header } from '@/components/marketing/header'

export const Route = createFileRoute('/auth')({
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
      <main className="flex min-h-[60vh] flex-1 items-center justify-center py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
