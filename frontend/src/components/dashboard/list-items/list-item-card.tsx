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

  const placeholderImage = '/placeholders/gift-placeholder.svg'

  return (
    <>
      <Card
        key={item.publicId}
        className="overflow-hidden border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
      >
        <div className="relative mb-4">
          <img
            src={item.imageUrl || placeholderImage}
            alt={item.name}
            className="mx-auto h-36 w-auto object-cover"
          />

          {/* Status Badges */}
          {item.status === 'gifted' && (
            <Badge
              variant="default"
              className="absolute right-3 top-0 h-9 w-fit rounded-sm text-sm"
            >
              {item.giftedBy ? `${item.giftedBy} got this for you!` : 'Gifted!'}
            </Badge>
          )}

          {/* topPick button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleTopPickToggle}
                disabled={isPending}
                className={cn(
                  'group absolute left-3 top-0 h-8 w-8',
                  item.topPick ? 'bg-blush' : 'hover:bg-blush bg-white/80',
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
        <div className="flex flex-col justify-between gap-6">
          {/* Product Title */}
          <h2 className="text-md font-semibold leading-tight text-gray-700">
            {item.name}
          </h2>

          <div className="space-y-2">
            {/* Details Section */}
            <div className="flex flex-row justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm">Desired:</p>
                <p className="font-medium">{item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm">Purchased:</p>
                <p className="font-medium">{item.quantityGifted || 0}</p>
              </div>
            </div>

            <div className="flex flex-row justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm">Size:</p>
                <p
                  className={cn(
                    'font-medium',
                    !item.size && 'text-sm font-semibold text-gray-500',
                  )}
                >
                  {item.size || 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm">Colour:</p>
                <p
                  className={cn(
                    'font-medium',
                    !item.colour && 'text-sm font-semibold text-gray-500',
                  )}
                >
                  {item.colour || 'N/A'}
                </p>
              </div>
            </div>

            {/* Where to Buy */}
            <div>
              <h3 className="-mb-1 pt-2 text-gray-700">Where to buy</h3>
              <div className="flex flex-row justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm">Shop:</p>
                  <p
                    className={cn(
                      'font-medium',
                      !item.shopName && 'text-sm font-semibold text-gray-500',
                    )}
                  >
                    {item.shopName || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm">Product link:</p>
                  <Button
                    variant="link"
                    asChild
                    className="p-0 has-[>svg]:px-0"
                  >
                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        !item.productUrl &&
                          'text-gray-500! pointer-events-none text-sm',
                      )}
                    >
                      {item.productUrl ? (
                        <ExternalLink
                          className={cn('hover:text-blush h-4 w-4')}
                        />
                      ) : (
                        'N/A'
                      )}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex justify-end">
            <Button
              className="w-full lg:w-fit"
              variant="outline"
              onClick={() => setIsSheetOpen(true)}
            >
              Edit
            </Button>
          </div>
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
