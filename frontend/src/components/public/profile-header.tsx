import { useState } from 'react'

import type { PublicListOwner } from '@shared/types'
import { CheckIcon, DotIcon, Share } from 'lucide-react'
import { toast } from 'sonner'

import { prettifyInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function ProfileHeader({
  listOwner,
}: {
  listOwner: PublicListOwner | undefined
}) {
  const { name, avatar, profileSlug, accountCountry } = listOwner || {}
  const [copied, setCopied] = useState(false)
  const shareableListLink = `${import.meta.env.VITE_APP_BASE_URL}/${profileSlug}`

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareableListLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link: ', { description: String(error) })
    }
  }

  return (
    <header className="w-full">
      <div className="from-tangerine via-blush to-dusk relative h-32 bg-gradient-to-r">
        <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2">
          <Avatar className="border-background h-24 w-24 border-2 shadow-lg">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-amethyst font-serif text-2xl font-semibold text-white">
              {prettifyInitials(name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="space-y-1 pt-16">
        <h1 className="text-foreground text-center text-2xl">{name}</h1>
        <div className="flex items-center justify-center gap-1 text-sm">
          <p className="font-medium text-gray-700">@{profileSlug}</p>
          <DotIcon className="size-6 text-gray-600" />
          <p className="font-medium text-gray-700">{accountCountry}</p>
        </div>
      </div>

      <div className="flex items-center justify-center pt-3">
        <Button variant="outline" size="sm" onClick={handleShare}>
          {copied ? <CheckIcon /> : <Share />}
          {copied ? 'Profile Link Copied' : 'Share'}
        </Button>
      </div>
    </header>
  )
}
