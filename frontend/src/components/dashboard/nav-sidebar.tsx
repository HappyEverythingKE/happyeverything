'use client'

import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import IconLogo from '@/assets/logos/logo-icon.svg'
import {
  allProfilesQueryOptions,
  fetchProfileQueryOptions,
} from '@/services/profile.api'
import type { CurrentUser } from '@shared/types'
import { LifeBuoy } from 'lucide-react'

import {
  NavSecondarySkeleton,
  NavSidebarSkeleton,
  NavUserSkeleton,
} from '@/components/ui/navbar-skeleton'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { NavMain } from '@/components/dashboard/nav-main'
import { NavSecondary } from '@/components/dashboard/nav-secondary'
import { NavUser } from '@/components/dashboard/nav-user'

// Sidebar nav data
const navData = {
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
  ],
}

interface NavSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: CurrentUser
  profileSlug?: string
}

export function NavSidebar({ user, profileSlug, ...props }: NavSidebarProps) {
  // profileSlug is undefined when the user is on their accounts page
  if (!profileSlug) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar">
                <Link to="/">
                  <div className="flex items-center justify-center">
                    <img
                      src={IconLogo}
                      alt="Happy Everything"
                      className="size-22 aspect-square"
                      width="110px"
                      height="62px"
                    />
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="pt-4">
          <NavSidebarSkeleton />
        </SidebarContent>
        <SidebarSeparator />
        <NavSecondarySkeleton />
        <SidebarSeparator />
        <SidebarFooter>
          <NavUserSkeleton />
        </SidebarFooter>
      </Sidebar>
    )
  }

  const { data: allProfiles } = useSuspenseQuery(allProfilesQueryOptions)
  const { data: selectedProfile } = useSuspenseQuery(
    fetchProfileQueryOptions(profileSlug)!,
  )

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar">
              <Link to="/">
                <div className="flex items-center justify-center">
                  <img
                    src={IconLogo}
                    alt="Happy Everything"
                    className="size-22 aspect-square"
                    width="110px"
                    height="62px"
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <NavMain profileSlug={selectedProfile.slug} />
      </SidebarContent>
      <SidebarSeparator />
      <NavSecondary items={navData.navSecondary} />
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser
          user={user}
          profiles={allProfiles}
          currentSlug={selectedProfile.slug}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
