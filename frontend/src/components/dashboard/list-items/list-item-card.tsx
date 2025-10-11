import { useState } from 'react'

import { useUpdateListItemPriority } from '@/services/list-item.api'
import type { ListItem } from '@shared/types'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ItemCard } from '@/components/ui/item-card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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

  // Gifted Badge Component
  const giftedBadge = item.gifters && item.gifters.length > 0 && (
    <>
      {/* Desktop Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="blush"
            className="bg-blush/40 text-amethyst absolute right-2 top-0 hidden px-3 py-1 lg:block"
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

      {/* Mobile Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Badge
            variant="blush"
            className="bg-blush/40 text-amethyst absolute right-2 top-0 px-3 py-1 lg:hidden"
          >
            {item.gifters
              ? `${multiGifterDisplay} gifted you`
              : 'Anonymous gifted you'}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="bg-tertiary text-tertiary-foreground z-50 w-fit text-balance rounded-md px-3 py-1.5 text-xs">
          <p className="text-sm font-medium">
            {item.gifters
              ?.map(
                (gifter) =>
                  `${gifter.gifter_name || 'Someone'} (${gifter.quantity_reserved})`,
              )
              .join(', ')}
          </p>
        </PopoverContent>
      </Popover>
    </>
  )

  // Top Pick Button Component
  const topPickButton = (
    <>
      {/* Desktop Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleTopPickToggle}
            disabled={isPending}
            className={cn(
              'group absolute left-2 top-0 hidden h-8 w-8 rounded-full lg:flex',
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

      {/* Mobile Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleTopPickToggle}
            disabled={isPending}
            className={cn(
              'group absolute left-2 top-0 h-8 w-8 rounded-full lg:hidden',
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
        </PopoverTrigger>
        <PopoverContent className="bg-tertiary text-tertiary-foreground z-50 w-fit text-balance rounded-md px-3 py-1.5 text-xs">
          <p className="text-sm">
            {item.topPick ? 'Remove from top picks' : 'Add to top picks'}
          </p>
        </PopoverContent>
      </Popover>
    </>
  )

  // Footer Component
  const footer = (
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
  )

  return (
    <>
      <ItemCard
        item={item}
        placeholderImage={placeholderImage}
        giftedBadge={giftedBadge}
        topPickButton={topPickButton}
        footer={footer}
      />

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
