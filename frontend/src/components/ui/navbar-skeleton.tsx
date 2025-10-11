import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export function NavSidebarSkeleton() {
  return (
    <>
      {/* NavMain skeleton - New wish list button */}
      <SidebarGroup>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-4 w-24" />
        </div>
      </SidebarGroup>

      {/* NavMain skeleton - Wish lists section */}
      <SidebarGroup>
        <div className="px-2 py-1.5">
          <Skeleton className="mb-2 h-4 w-20" />
        </div>
        <SidebarMenu>
          {Array.from({ length: 3 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-32" />
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

export function NavSecondarySkeleton() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {Array.from({ length: 1 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-4 w-16" />
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
