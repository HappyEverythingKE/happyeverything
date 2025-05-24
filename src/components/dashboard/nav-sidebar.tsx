'use client'

import * as React from 'react'
import { Link } from '@tanstack/react-router'

import IconLogo from '@/assets/logos/logo-icon.svg'
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
import { NavUser } from '@/components/dashboard/nav-user'

import { NavSecondary } from './nav-secondary'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
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

export function NavSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                    className="aspect-square size-22"
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
        <NavMain items={data.userLists} />
      </SidebarContent>
      <SidebarSeparator />
      <NavSecondary items={data.navSecondary} />
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
