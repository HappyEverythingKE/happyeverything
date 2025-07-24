'use client'

import * as React from 'react'
import { Link } from '@tanstack/react-router'

import IconLogo from '@/assets/logos/logo-icon.svg'
import type { CurrentUser, Profile } from '@shared/types'
import { LifeBuoy, Send } from 'lucide-react'

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

import { ProfileSwitcher } from './profile-switcher'

// Sidebar nav data
const navData = {
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
  ],
}

interface NavSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: CurrentUser
  selectedProfile: Profile
  allProfiles: Profile[]
}

export function NavSidebar({
  user,
  selectedProfile,
  allProfiles,
  ...props
}: NavSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="active:bg-sidebar">
              <Link
                to="/dashboard/$profileSlug"
                params={{ profileSlug: selectedProfile.slug }}
              >
                <div className="flex items-center justify-center">
                  <img
                    src={IconLogo}
                    alt="My Happy Everything"
                    className="size-22 aspect-square"
                    width="110px"
                    height="62px"
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/*  profile switcher */}
        <ProfileSwitcher
          profiles={allProfiles}
          currentSlug={selectedProfile.slug}
        />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <NavMain profileSlug={selectedProfile.slug} />
      </SidebarContent>
      <SidebarSeparator />
      <NavSecondary items={navData.navSecondary} />
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
