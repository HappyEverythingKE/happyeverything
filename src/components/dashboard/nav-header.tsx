import { Bell } from 'lucide-react'

import { SidebarTrigger } from '@/components/ui/sidebar'

export default function NavHeader() {
  return (
    <header className="flex h-18 shrink-0 items-center justify-between gap-2 px-8 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="bg-sidebar-border mr-2 h-4 w-[1px]" />
        <h1 className="md:text-md">Welcome, username</h1>
      </div>
      <div className="hidden lg:block">
        <Bell className="size-4 lg:size-5" />
      </div>
    </header>
  )
}
