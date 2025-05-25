import React from 'react'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import TanstackQueryLayout from '@/integrations/tanstack-query/layout'

import { Toaster } from '@/components/ui/sonner'

interface MyRouterContext {
  queryClient: QueryClient
}

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import('@tanstack/react-router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      )

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <div className="bg-background-primary flex min-h-svh flex-col">
        <Outlet />
        <Toaster richColors position="bottom-center" />
      </div>

      <React.Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </React.Suspense>

      <TanstackQueryLayout />
    </>
  ),
})
