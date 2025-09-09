import type { PublicListOwner } from '@shared/types'
import { startCase } from 'lodash'
import { DotIcon, Share } from 'lucide-react'

import { prettifyInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function ProfileHeader({
  listOwner,
}: {
  listOwner: PublicListOwner | undefined
}) {
  const { name, avatar, profileSlug, accountCountry } = listOwner || {}
  return (
    <header>
      <div className="from-tangerine via-blush to-dusk relative h-32 rounded-2xl bg-gradient-to-r">
        <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2">
          <Avatar className="border-background h-24 w-24 border-2 shadow-lg">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-amethyst font-serif text-2xl font-semibold text-white">
              {prettifyInitials(name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="space-y-2 pt-16">
        <h1 className="text-foreground text-center text-2xl">{name}</h1>
        <div className="flex items-center justify-center gap-1 text-sm">
          <p className="text-gray-600">@{profileSlug}</p>
          <DotIcon className="size-4 text-gray-500" />
          <p className="text-gray-600">{startCase(accountCountry)}</p>
        </div>
      </div>

      <div className="flex items-center justify-center pt-4">
        <Button variant="outline" size="sm">
          <Share />
          Share
        </Button>
      </div>
    </header>
  )
}
