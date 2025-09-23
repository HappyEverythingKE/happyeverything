import { useState } from 'react'

import { useUpdateListItemPriority } from '@/services/list-item.api'
import type { ListItem } from '@shared/types'
import { ExternalLink, Heart } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SheetForm } from '@/components/ui/sheet-form'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EditListItemForm } from '@/components/dashboard/forms/edit-list-item-form'

export const ListItemCard = ({
  profileSlug,
  listSlug,
  item,
}: {
  profileSlug: string
  listSlug: string
  item: ListItem
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const placeholderImage = '/placeholders/gift-placeholder.svg'

  const handleSubmit = () => setIsSheetOpen(false)
  const handleCancel = () => setIsSheetOpen(false)

  const { mutateAsync: updateListItemPriority, isPending } =
    useUpdateListItemPriority(profileSlug, listSlug, item.publicId)

  const handleTopPickToggle = async () => {
    try {
      const newTopPickValue = !item.topPick
      await updateListItemPriority(Boolean(newTopPickValue))
      toast.success(
        newTopPickValue ? 'Added to Top Picks' : 'Removed from Top Picks',
      )
    } catch (error) {
      toast.error('An error occurred.', {
        description: String(error),
      })
    }
  }

  const getGifterDisplayName = (gifters: ListItem['gifters']) => {
    if (!gifters || gifters?.length === 0) return null
    return gifters.length > 1
      ? `${gifters.length} people`
      : gifters[0].gifter_name || 'Someone'
  }
  const multiGifterDisplay = getGifterDisplayName(item.gifters)

  return (
    <>
      <Card
        key={item.publicId}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-md border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
      >
        {/* Dim overlay when gifted */}
        {item.stillNeeds === 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-gradient-to-b from-transparent to-gray-200/70 dark:to-gray-900/70" />
        )}

        {/* Image / Badge Area */}
        <div className="h-38 relative flex items-center justify-center overflow-hidden">
          <img
            src={item.imageUrl || placeholderImage}
            alt={item.name}
            className="h-full w-full object-contain"
          />

          {/* Gifted Badge */}
          {item.gifters && item.gifters.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="blush"
                  className="bg-blush/40 text-amethyst absolute right-2 top-0 px-3 py-1"
                >
                  {item.gifters
                    ? `${multiGifterDisplay} gifted you`
                    : 'Anonymous gifted you'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="font-medium">
                {item.gifters
                  ?.map(
                    (gifter) =>
                      `${gifter.gifter_name || 'Someone'} (${gifter.quantity_reserved})`,
                  )
                  .join(', ')}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Top Pick Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleTopPickToggle}
                disabled={isPending}
                className={cn(
                  'group absolute left-2 top-0 h-8 w-8 rounded-full',
                  item.topPick ? 'bg-blush' : 'hover:bg-blush/20 bg-white/80',
                )}
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    item.topPick
                      ? 'text-white'
                      : 'text-blush group-hover:text-white',
                  )}
                />
                <span className="sr-only">
                  {item.topPick ? 'Remove from top picks' : 'Add to top picks'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {item.topPick ? 'Remove from top picks' : 'Add to top picks'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Card Content */}
        <div className="flex flex-1 flex-col justify-between">
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
              <dd
                className={cn('font-medium', !item.colour && 'text-gray-500')}
              >
                {item.colour || '—'}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Shop</dt>
              <dd
                className={cn('font-medium', !item.shopName && 'text-gray-500')}
              >
                {item.shopName || '—'}
              </dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Product link</dt>
              {item.productUrl ? (
                <dd>
                  <a
                    href={item.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline-offset-3 inline-flex items-center gap-1 font-medium underline"
                  >
                    View{' '}
                    <ExternalLink className="hover:text-blush h-3.5 w-3.5" />
                  </a>
                </dd>
              ) : (
                <dd className="text-gray-500">—</dd>
              )}
            </div>
          </dl>
        </div>

        {/* Footer */}
        <div className="flex justify-center">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setIsSheetOpen(true)}
            disabled={item.stillNeeds === 0}
          >
            {item.stillNeeds === 0 ? 'Completed' : 'Edit'}
          </Button>
        </div>
      </Card>

      {/* Sheet Form */}
      <SheetForm
        isOpen={isSheetOpen}
        onClose={handleCancel}
        title="Edit Gift Item"
        description="You can edit the details of an item before it is claimed (or gifted) by someone."
      >
        <EditListItemForm
          profileSlug={profileSlug}
          listSlug={listSlug}
          listItem={item}
          onFormSubmit={handleSubmit}
          onFormCancel={handleCancel}
        />
      </SheetForm>
    </>
  )
}
