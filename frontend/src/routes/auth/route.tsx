import { createFileRoute, Outlet } from '@tanstack/react-router'

import { Footer } from '@/components/marketing/footer'
import { Header } from '@/components/marketing/header'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Header />
      <main className="flex min-h-[60vh] flex-1 items-center justify-center py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
