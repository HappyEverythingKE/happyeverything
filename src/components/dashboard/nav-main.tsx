'use client'

import { PlusCircle, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}) {
  return (
    <>
      <SidebarGroup>
        <SidebarMenuButton asChild>
          <Button variant="buttonIcon">
            <PlusCircle />
            <span>New wish list</span>
          </Button>
        </SidebarMenuButton>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Your wish lists</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
