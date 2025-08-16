import { useState } from 'react'

import type { ListItem } from '@shared/types'
import { Bookmark } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SheetForm } from '@/components/ui/sheet-form'
import { EditListItemForm } from '@/components/dashboard/forms/edit-list-item-form'

export const ListItemCard = ({
  profileSlug,
  listSlug,
  listItem,
}: {
  profileSlug: string
  listSlug: string
  listItem: ListItem
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const handleSubmit = () => setIsSheetOpen(false)
  const handleCancel = () => setIsSheetOpen(false)

  return (
    <>
      <div key={listItem.id} className="border-border-primary border">
        <div className="w-full overflow-hidden">
          <img
            src={listItem.imageUrl}
            alt={listItem.name}
            className="aspect-[3/2] size-full object-cover"
          />
        </div>
        <div className="flex flex-col p-6">
          <div className="mb-2 flex items-center justify-between gap-4">
            <h2 className="text-md font-bold leading-[1.4] md:text-xl">
              {listItem.name}
            </h2>
            <div className="p-2">
              <Button
                className="cursor-pointer"
                size="icon"
                variant="ghost"
                asChild
              >
                <Bookmark className="size-6" />
              </Button>
            </div>
          </div>

          {/* <p className="mb-3 md:mb-4">{property.description}</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <BiMap className="size-6" />
            <span className="text-sm">{property.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <BiBed className="size-6" />
            <span className="text-sm">{property.numberOfBeds}</span>
          </div>
          <div className="flex items-center gap-2">
            <BiBath className="size-6" />
            <span className="text-sm">{property.numberOfBaths}</span>
          </div>
        </div> */}
          <div className="mt-5 flex items-center justify-between gap-4 md:mt-6">
            <div>
              <span className="text-xl font-bold md:text-2xl">Price</span>
              <span className={`before:content-['_']`}>Duration</span>
            </div>
            <Button variant="secondary" onClick={() => setIsSheetOpen(true)}>
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Sheet Form */}
      <SheetForm
        isOpen={isSheetOpen}
        onClose={handleCancel}
        title="Add Gift"
        description="Add a new gift to your wish list"
      >
        <EditListItemForm
          profileSlug={profileSlug}
          listSlug={listSlug}
          listItem={listItem}
          onFormSubmit={handleSubmit}
          onFormCancel={handleCancel}
        />
      </SheetForm>
    </>
  )
}
