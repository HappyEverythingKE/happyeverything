import { SidebarTrigger } from '@/components/ui/sidebar'
import NavBreadcrumb from '@/components/dashboard/nav-breadcrumb'

interface NavHeaderProps {
  displayName: string
}

export default function NavHeader({ displayName }: NavHeaderProps) {
  return (
    <header className="h-18 flex shrink-0 items-center justify-between gap-2 px-8 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="bg-sidebar-border mr-2 h-4 w-[1px]" />
        <NavBreadcrumb userName={displayName} />
      </div>
    </header>
  )
}
