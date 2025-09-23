'use client'

import { useState } from 'react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { listsByProfileQueryOptions } from '@/services/list.api'
import { Gift, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SheetForm } from '@/components/ui/sheet-form'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar'
import { NewListForm } from '@/components/dashboard/forms/new-list-form'

export function NavMain({ profileSlug }: { profileSlug: string }) {
  const matchRoute = useMatchRoute()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const { data: lists, isLoading } = useQuery(
    listsByProfileQueryOptions(profileSlug),
  )

  const handleSubmit = () => setIsSheetOpen(false)
  const handleCancel = () => setIsSheetOpen(false)

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 3 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    )
  }

  if (!lists || lists.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Your wish lists</SidebarGroupLabel>
        <SidebarMenuButton disabled tooltip="Nothing here yet">
          <Gift />
          <span>Nothing here yet</span>
        </SidebarMenuButton>
      </SidebarGroup>
    )
  }

  return (
    <>
      <SidebarGroup>
        <SidebarMenuButton asChild tooltip="New wish list">
          <Button variant="buttonIcon" onClick={() => setIsSheetOpen(true)}>
            <PlusCircle />
            <span>New wish list</span>
          </Button>
        </SidebarMenuButton>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="text-sm text-black">
          Your wish lists
        </SidebarGroupLabel>
        <SidebarMenu>
          {lists.map((item) => (
            <SidebarMenuItem key={item.slug}>
              <SidebarMenuButton
                asChild
                tooltip={item.name}
                isActive={
                  !!matchRoute({
                    to: '/dashboard/$profileSlug/$listSlug',
                    params: { profileSlug, listSlug: item.slug },
                  })
                }
              >
                <Link
                  to="/dashboard/$profileSlug/$listSlug"
                  params={{ profileSlug, listSlug: item.slug }}
                >
                  <Gift />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Sheet Form */}
      <SheetForm
        isOpen={isSheetOpen}
        onClose={handleCancel}
        title="New List"
        description="Create a new wish list"
      >
        <NewListForm
          profileSlug={profileSlug}
          onFormSubmit={handleSubmit}
          onFormCancel={handleCancel}
        />
      </SheetForm>
    </>
  )
}
