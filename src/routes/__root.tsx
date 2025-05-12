import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import TanstackQueryLayout from '@/integrations/tanstack-query/layout'

import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <div className="bg-primary-foreground flex min-h-svh flex-col">
        <Navbar />
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
