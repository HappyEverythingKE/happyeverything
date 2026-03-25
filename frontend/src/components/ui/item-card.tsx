import type { ListItem } from '@shared/types'
import { ExternalLink, Heart } from 'lucide-react'

import { getImageVariantUrl } from '@/lib/get-image-variant-url'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ShimmerImage } from '@/components/ui/shimmer-image'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ItemCardProps {
  item: ListItem
  placeholderImage?: string
  showTopPickBadge?: boolean
  topPickButton?: React.ReactNode
  giftedBadge?: React.ReactNode
  footer: React.ReactNode
  className?: string
}

export function ItemCard({
  item,
  placeholderImage = '/placeholders/gift-placeholder.svg',
  showTopPickBadge = false,
  topPickButton,
  giftedBadge,
  footer,
  className,
}: ItemCardProps) {
  const isProductUrl = (() => {
    if (!item.shop) return false
    try {
      new URL(item.shop)
      return true
    } catch {
      return false
    }
  })()

  const imageUrl = getImageVariantUrl({
    imageId: item.imageId,
    context: 'list-item',
  })

  return (
    <Card
      key={item.id}
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden rounded-md border-stone-200 bg-white p-6 transition-shadow hover:shadow-md md:min-w-full',
        className,
      )}
    >
      {/* Dim overlay when gifted */}
      {item.stillNeeds === 0 && (
        // FIX: Removed `z-10` — the z-index was creating a compositing layer on Android
        // that could intercept touch events. `pointer-events-none` already ensures the
        // overlay doesn't block clicks; no z-index is needed for a purely visual overlay.
        <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-b from-gray-100/10 to-gray-300/70 dark:to-gray-900/70" />
      )}

      {/* Image / Badge Area */}
      <div className="relative flex items-center justify-center overflow-hidden">
        <ShimmerImage
          className="h-38 w-full"
          src={imageUrl || placeholderImage}
          alt={item.name}
          lazy={true}
          imgClassName="object-contain"
        />

        {/* Gifted Badge */}
        {giftedBadge}

        {/* Top Pick Badge - shown on public lists */}
        {showTopPickBadge && item.topPick && (
          <>
            {/* Desktop Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-blush absolute left-3 top-0 hidden h-8 w-8 items-center justify-center rounded-full lg:flex">
                  <Heart className="h-4 w-4 text-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>A Favourite!</p>
              </TooltipContent>
            </Tooltip>

            {/* Mobile Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-blush group absolute left-2 top-0 h-8 w-8 rounded-full lg:hidden"
                >
                  <Heart className="h-4 w-4 text-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-tertiary text-tertiary-foreground z-50 w-fit text-balance rounded-md px-3 py-1.5 text-xs">
                <p className="text-sm">A Favourite!</p>
              </PopoverContent>
            </Popover>
          </>
        )}

        {/* Top Pick Button - shown on dashboard */}
        {topPickButton}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-start">
        {/* Product Title */}
        <h2 className="text-foreground mb-4 border-y py-2 font-semibold">
          {item.name}
        </h2>

        {/* Details Grid */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm md:text-base">
          <div>
            <dt className="text-muted-foreground">Requested</dt>
            <dd className="font-medium">{item.quantity}</dd>
          </div>

          <div>
            <dt className="text-muted-foreground">Still Needs</dt>
            <dd className="font-medium">{item.stillNeeds}</dd>
          </div>

          <div>
            <dt className="text-muted-foreground">Size</dt>
            <dd className={cn('font-medium', !item.size && 'text-gray-500')}>
              {item.size || '—'}
            </dd>
          </div>

          <div>
            <dt className="text-muted-foreground">Colour</dt>
            <dd className={cn('font-medium', !item.colour && 'text-gray-500')}>
              {item.colour || '—'}
            </dd>
          </div>

          <div className="col-span-2">
            <dt className="text-muted-foreground">Shop</dt>
            {isProductUrl ? (
              <dd>
                <a
                  href={item.shop}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline-offset-3 inline-flex items-center gap-1 font-medium underline"
                >
                  View <ExternalLink className="hover:text-blush h-3.5 w-3.5" />
                </a>
              </dd>
            ) : (
              <dd className={cn('font-medium', !item.shop && 'text-gray-500')}>
                {item.shop || '—'}
              </dd>
            )}
          </div>

          <div className="col-span-2">
            <dt className="text-muted-foreground">Notes</dt>
            <dd className="text-sm">{item.notes || '—'}</dd>
          </div>
        </dl>
      </div>

      {/* Footer */}
      {footer}
    </Card>
  )
}
