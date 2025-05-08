import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'
import TanstackQueryLayout from '../integrations/tanstack-query/layout'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />

      <Outlet />
      <TanStackRouterDevtools />

      <TanstackQueryLayout />
    </>
  ),
})
