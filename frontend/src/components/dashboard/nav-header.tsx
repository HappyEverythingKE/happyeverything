import type { CurrentUser } from '@shared/types'
import { Bell } from 'lucide-react'

import { SidebarTrigger } from '@/components/ui/sidebar'

interface NavHeaderProps {
  user: CurrentUser
}

export default function NavHeader({ user }: NavHeaderProps) {
  const firstName = user.name?.split(' ')[0] || 'friend'

  return (
    <header className="h-18 flex shrink-0 items-center justify-between gap-2 px-8 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="bg-sidebar-border mr-2 h-4 w-[1px]" />
        <h1 className="md:text-md">Welcome, {firstName}</h1>
      </div>
      <div className="hidden lg:block">
        <Bell className="size-4 lg:size-5" />
      </div>
    </header>
  )
}
