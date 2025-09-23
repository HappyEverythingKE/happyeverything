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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.items.map((item) => (
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
              {item.stillNeeds === 0 && (
                <Badge
                  variant="blush"
                  className="absolute right-3 top-0 h-9 px-3 text-base"
                >
                  Gifted
                </Badge>
              )}

              {/* Top Pick Badge */}
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
                  <dd
                    className={cn('font-medium', !item.size && 'text-gray-500')}
                  >
                    {item.size || '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Colour</dt>
                  <dd
                    className={cn(
                      'font-medium',
                      !item.colour && 'text-gray-500',
                    )}
                  >
                    {item.colour || '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-muted-foreground">Shop</dt>
                  <dd
                    className={cn(
                      'font-medium',
                      !item.shopName && 'text-gray-500',
                    )}
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

            {/* Reserve Gift Button */}
            <div className="flex justify-center">
              <Button
                className="w-full"
                disabled={item.stillNeeds === 0}
                onClick={() => setSelectedItem(item)}
              >
                {item.stillNeeds === 0 ? 'Reserved' : "I'll get this"}
              </Button>
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
