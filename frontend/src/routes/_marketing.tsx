import { createFileRoute, Outlet } from '@tanstack/react-router'

import { Footer } from '@/components/marketing/footer'
import { Header } from '@/components/marketing/header'

export const Route = createFileRoute('/_marketing')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
