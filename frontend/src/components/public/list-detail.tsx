import { useState } from 'react'

import type { ListItem, ListWithItems } from '@shared/types'
import { ExternalLink, Heart } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DialogForm } from '@/components/ui/dialog-form'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ReserveGiftForm } from '@/components/dashboard/forms/reserve-gift-form'

export function ListDetail({
  profileSlug,
  list,
}: {
  profileSlug: string
  list: ListWithItems
}) {
  const placeholderImage = '/placeholders/gift-placeholder.svg'
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null)

  const handleDialogSubmit = () => {
    setSelectedItem(null)
  }

  const handleDialogCancel = () => {
    setSelectedItem(null)
  }

  return (
    <div className="px-[5%] py-16 md:py-24 lg:py-20">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.items.map((item) => (
          <Card
            key={item.publicId}
            className="overflow-hidden border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="relative p-6">
              <div className="mx-auto mb-4 aspect-square h-48 overflow-hidden rounded-lg">
                <img
                  src={item.imageUrl || placeholderImage}
                  alt={item.name}
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Status Badges */}
              {item.stillNeeds === 0 && (
                <Badge
                  variant="default"
                  className="absolute right-3 top-0 h-9 w-fit rounded-sm text-sm"
                >
                  Gifted!
                </Badge>
              )}

              {/* topPick badge */}
              {item.topPick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-blush absolute left-3 top-0 flex h-8 w-8 items-center justify-center rounded-full">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>A Favourite!</p>
                  </TooltipContent>
                </Tooltip>
              )}
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
                    <p className="text-sm">Requested:</p>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">Still Needs:</p>
                    <p className="font-medium">{item.stillNeeds}</p>
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
                          !item.shopName &&
                            'text-sm font-semibold text-gray-500',
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

                {/* Reserve Gift Button */}
                <div className="flex flex-row justify-end gap-2">
                  <Button
                    variant="default"
                    disabled={item.stillNeeds === 0}
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.stillNeeds === 0 ? 'Reserved' : "I'll get this"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reserve Gift Dialog Form */}
      {selectedItem && (
        <DialogForm
          isOpen={!!selectedItem}
          onClose={handleDialogCancel}
          title={`Get this gift for ${profileSlug}!`}
          description="Let them know that you'll get this gift for them."
        >
          <ReserveGiftForm
            profileSlug={profileSlug}
            listSlug={list.slug}
            itemReservationInfo={{
              itemPublicId: selectedItem.publicId,
              itemQuantity: selectedItem.quantity,
              stillNeeds: selectedItem.stillNeeds || selectedItem.quantity,
            }}
            onFormSubmit={handleDialogSubmit}
            onFormCancel={handleDialogCancel}
          />
        </DialogForm>
      )}
    </div>
  )
}
