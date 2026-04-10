import { useState } from 'react'

import type { ListItem } from '@shared/types'
import { ChevronDown, Gift, PlusCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
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
  const [giftedOpen, setGiftedOpen] = useState(false)

  const handleSubmit = () => setIsSheetOpen(false)
  const handleCancel = () => setIsSheetOpen(false)

  const activeItems = listItems.filter((item) => item.stillNeeds !== 0)
  const giftedItems = listItems.filter((item) => item.stillNeeds === 0)

  return (
    <>
      <div className="flex flex-col gap-8 w-full">
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

        {/* Active items */}
        <div className="mx-auto grid w-full grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {activeItems.map((item) => (
            <ListItemCard
              key={item.id}
              profileSlug={profileSlug}
              listSlug={listSlug}
              item={item}
            />
          ))}
        </div>

        {/* Gifted items collapsible */}
        {giftedItems.length > 0 && (
          <div className="border-t border-border/60 pt-4">
            <button
              onClick={() => setGiftedOpen((prev) => !prev)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group w-full"
            >
              <Gift className="h-4 w-4 shrink-0" />
              <span>
                {giftedItems.length} gifted item{giftedItems.length !== 1 ? 's' : ''}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 ml-1 transition-transform duration-300',
                  giftedOpen && 'rotate-180',
                )}
              />
            </button>

            <div
              className={cn(
                'grid transition-all duration-300 ease-in-out',
                giftedOpen
                  ? 'grid-rows-[1fr] opacity-100 mt-6'
                  : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="mx-auto grid w-full grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {giftedItems.map((item) => (
                    <ListItemCard
                      key={item.id}
                      profileSlug={profileSlug}
                      listSlug={listSlug}
                      item={item}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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
