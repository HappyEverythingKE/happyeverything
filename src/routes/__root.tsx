import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import TanstackQueryLayout from '@/integrations/tanstack-query/layout'

import { Footer } from '@/components/marketing/footer'
import { Header } from '@/components/marketing/header'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <div className="bg-background-primary flex min-h-svh flex-col">
        <Header />
        <main className="container mx-auto grow">
          <Outlet />
        </main>
        <Footer />
      </div>
      <TanStackRouterDevtools />

      <TanstackQueryLayout />
    </>
  ),
})
