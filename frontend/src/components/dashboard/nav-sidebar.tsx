'use client'

import * as React from 'react'
import { Link } from '@tanstack/react-router'

import IconLogo from '@/assets/logos/logo-icon.svg'
import type { CurrentUser } from '@shared/types'
import { Gift, LifeBuoy, Send } from 'lucide-react'

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

// Sample data for lists and nav items
const navData = {
  userLists: [
    {
      title: "Mark and Samantha's Wedding",
      icon: Gift,
      url: '#',
      isActive: true,
    },
    {
      title: 'List 2',
      icon: Gift,
      url: '#',
    },
    {
      title: 'List 3',
      icon: Gift,
      url: '#',
    },
  ],
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
}

export function NavSidebar({ user, ...props }: NavSidebarProps) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="active:bg-sidebar">
              <Link to="/dashboard">
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
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <NavMain items={navData.userLists} />
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
