'use client'

import { Link } from '@tanstack/react-router'

import type { Profile } from '@shared/types'
import { AtSign, ChevronsUpDown, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function ProfileSwitcher({
  profiles,
  currentSlug,
}: {
  profiles: Profile[]
  currentSlug: string
}) {
  const { isMobile } = useSidebar()
  const activeProfile = profiles.find((p) => p.slug === currentSlug)

  if (!activeProfile) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-muted data-[state=open]:text-muted-foreground">
              <div className="flex items-center gap-2">
                <AtSign className="size-4" />
                <span className="text-sm">Profiles</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Switch profile
            </DropdownMenuLabel>

            {profiles.map((profile, index) => (
              <DropdownMenuItem
                asChild
                key={profile.slug}
                className={cn(
                  'gap-2 p-2',
                  profile.slug === currentSlug && 'bg-accent',
                )}
              >
                <Link
                  to="/dashboard/$profileSlug"
                  params={{ profileSlug: profile.slug }}
                >
                  <div className="size-4.5 flex items-center justify-center rounded-md border border-black/80">
                    {index + 1}
                  </div>
                  {profile.slug}
                </Link>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add profile
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
