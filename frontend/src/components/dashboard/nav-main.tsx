'use client'

import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { Gift, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SheetForm } from '@/components/ui/sheet-form'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NewListForm } from '@/components/dashboard/index/new-list-form'

export function NavMain({
  profileId,
  items,
}: {
  profileId: string
  items: {
    title: string
    slug: string
    isActive?: boolean
  }[]
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleSubmit = () => {
    setIsSheetOpen(false)
  }

  const handleCancel = () => {
    setIsSheetOpen(false)
  }
  return (
    <>
      <SidebarGroup>
        <SidebarMenuButton asChild>
          <Button variant="buttonIcon" onClick={() => setIsSheetOpen(true)}>
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
                <Link
                  to="/dashboard/lists/$listSlug"
                  params={{ listSlug: item.slug }}
                >
                  <Gift />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Sheet Form */}
      <SheetForm isOpen={isSheetOpen} onClose={handleCancel} title="New List">
        <NewListForm
          profileId={profileId}
          onFormSubmit={handleSubmit}
          onFormCancel={handleCancel}
        />
      </SheetForm>
    </>
  )
}
