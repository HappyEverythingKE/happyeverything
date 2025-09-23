import { useState } from 'react'

import type { ListItem, ListWithItems } from '@shared/types'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DialogForm } from '@/components/ui/dialog-form'
import { ItemCard } from '@/components/ui/item-card'
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
        {list.items.map((item) => {
          // Gifted Badge Component
          const giftedBadge = item.stillNeeds === 0 && (
            <Badge
              variant="blush"
              className="absolute right-3 top-0 h-9 px-3 text-sm"
            >
              Gifted
            </Badge>
          )

          // Footer Component
          const footer = (
            <div className="flex justify-center">
              <Button
                className="w-full"
                disabled={item.stillNeeds === 0}
                onClick={() => setSelectedItem(item)}
              >
                {item.stillNeeds === 0 ? 'Reserved' : "I'll get this"}
              </Button>
            </div>
          )

          return (
            <ItemCard
              key={item.publicId}
              item={item}
              placeholderImage={placeholderImage}
              showTopPickBadge={true}
              giftedBadge={giftedBadge}
              footer={footer}
            />
          )
        })}
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
