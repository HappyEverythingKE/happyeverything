import { useState } from 'react'

import type { ListItem } from '@shared/types'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SheetForm } from '@/components/ui/sheet-form'
import { NewListItemForm } from '@/components/dashboard/forms/new-list-item-form'
import { ListItemCard } from '@/components/dashboard/list-items/list-item-card'

export const WithListItems = ({
  profileSlug,
  listSlug,
  listItems,
}: {
  profileSlug: string
  listSlug: string
  listItems: ListItem[]
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleSubmit = () => setIsSheetOpen(false)
  const handleCancel = () => setIsSheetOpen(false)

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={() => setIsSheetOpen(true)}
            className="hover:bg-sidebar-accent hover:text-sidebar-muted-foreground hover:border-transparent! w-fit justify-start"
          >
            <PlusCircle />
            <span>Add a gift item</span>
          </Button>
        </div>

        <div className="mx-auto grid w-full grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {listItems.map((item) => (
            <ListItemCard
              key={item.id}
              profileSlug={profileSlug}
              listSlug={listSlug}
              item={item}
            />
          ))}
        </div>
      </div>

      {/* Sheet Form */}
      <SheetForm
        isOpen={isSheetOpen}
        onClose={handleCancel}
        title="Add Gift"
        description="Add a new gift to your wish list"
      >
        <NewListItemForm
          profileSlug={profileSlug}
          listSlug={listSlug}
          onFormSubmit={handleSubmit}
          onFormCancel={handleCancel}
        />
      </SheetForm>
    </>
  )
}
