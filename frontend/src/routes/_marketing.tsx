import { createFileRoute, Outlet } from '@tanstack/react-router'

import { Footer } from '@/components/marketing/footer'
import { Header } from '@/components/marketing/header'

export const Route = createFileRoute('/_marketing')({
  loader: async ({ context }) => {
    return { authState: context.authState }
  },
  component: LayoutComponent,
})

function LayoutComponent() {
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
