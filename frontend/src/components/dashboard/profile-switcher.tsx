'use client'

import { Link } from '@tanstack/react-router'

import type { Profile } from '@shared/types'
import { ChevronsUpDown, Plus, User } from 'lucide-react'

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
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <User className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeProfile.slug}
                </span>
                <span className="truncate text-xs">Profile</span>
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
                className="gap-2 p-2"
              >
                <Link
                  to="/dashboard/$profileSlug"
                  params={{ profileSlug: profile.slug }}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <User className="size-3.5 shrink-0" />
                  </div>
                  {profile.slug}
                  <div className="text-muted-foreground ml-auto text-xs">
                    ⌘{index + 1}
                  </div>
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
