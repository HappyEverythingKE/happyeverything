'use client'

import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { getLogout } from '@/services/auth.api'
import type { CurrentUser, Profile } from '@shared/types'
import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react'

import { getImageVariantUrl } from '@/lib/get-image-variant-url'
import { supabase } from '@/lib/supabase'
import { prettifyInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { ProfileSwitcher } from '@/components/dashboard/profile-switcher'

export function NavUser({
  user,
  profiles,
  currentSlug,
}: {
  user: CurrentUser
  profiles: Profile[]
  currentSlug: string
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const initials = prettifyInitials(user.name)

  const avatarImg = user.avatarId
    ? getImageVariantUrl({
        imageId: user.avatarId,
        context: 'avatar-thumb',
      })
    : null

  const handleLogout = async () => {
    await supabase.auth.signOut() // client-side logout
    await getLogout() // server-side logout
    queryClient.resetQueries()
    router.invalidate()
    navigate({ to: '/login' })
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatarImg || undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarImg || undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <ProfileSwitcher profiles={profiles} currentSlug={currentSlug} />
              <DropdownMenuItem>
                <Link
                  to="/dashboard/account"
                  className="flex items-center gap-2"
                >
                  <BadgeCheck />
                  Account
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
