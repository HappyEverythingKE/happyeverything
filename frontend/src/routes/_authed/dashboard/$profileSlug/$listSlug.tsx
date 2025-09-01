import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { listItemsQueryOptions } from '@/services/list-item.api'
import { fetchListQueryOptions } from '@/services/list.api'
import { startCase } from 'lodash'
import { Settings, Share2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DialogForm } from '@/components/ui/dialog-form'
import { ListsSkeleton } from '@/components/ui/lists-skeleton'
import { SheetForm } from '@/components/ui/sheet-form'
import { EditListForm } from '@/components/dashboard/forms/edit-list-form'
import { ShareListForm } from '@/components/dashboard/forms/share-list-form'
import { WithListItems } from '@/components/dashboard/list-items/with-list-items'
import WithoutListItems from '@/components/dashboard/list-items/without-list-items'

export const Route = createFileRoute(
  '/_authed/dashboard/$profileSlug/$listSlug',
)({
  loader: async ({ context, params }) => {
    const { profileSlug, listSlug } = params
    const list = await context.queryClient.fetchQuery(
      fetchListQueryOptions(profileSlug, listSlug),
    )
    return { profileSlug, list, crumb: list.name }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { profileSlug, list } = Route.useLoaderData()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // fetch list items
  const { data: listItems, isLoading } = useQuery(
    listItemsQueryOptions(profileSlug, list.slug),
  )
  const hasListItems = listItems && listItems.length > 0

  const handleSubmit = () => {
    setIsSheetOpen(false)
  }

  const handleCancel = () => {
    setIsSheetOpen(false)
  }

  const handleDialogSubmit = () => {
    setIsDialogOpen(false)
  }

  const handleDialogCancel = () => {
    setIsDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* List header */}
      <Card className="relative mb-8 overflow-hidden border-stone-200 bg-gradient-to-r from-stone-50 to-stone-100">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
            className="mx-auto h-full w-full object-cover"
            alt="decoration"
          />
        </div>

        <div className="z-10 flex flex-col items-center justify-center space-y-6 p-6">
          <h1 className="text-3xl font-medium">{list.name}</h1>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center md:flex-row md:gap-2">
              <p className="text-xs">Status: </p>
              <Badge variant="secondary">{startCase(list.status)}</Badge>
            </div>

            <div className="border-1 h-3 border-gray-800" />

            <div className="flex flex-col items-center md:flex-row md:gap-2">
              <p className="text-xs">Visibility: </p>
              <Badge variant="secondary">
                {list.isPrivate ? 'Private' : 'Public'}
              </Badge>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              size="icon"
              variant="outline"
              className="border-dark-tangerine hover:bg-secondary hover:border-dark-tangerine rounded-md bg-transparent"
              onClick={() => setIsDialogOpen(true)}
            >
              <Share2 className="text-dark-tangerine h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="border-dark-tangerine hover:bg-secondary hover:border-dark-tangerine rounded-md bg-transparent"
              onClick={() => setIsSheetOpen(true)}
            >
              <Settings className="text-dark-tangerine h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* List items */}
      <div className="flex h-full">
        {isLoading ? (
          <ListsSkeleton />
        ) : hasListItems ? (
          <WithListItems
            profileSlug={profileSlug}
            listSlug={list.slug}
            listItems={listItems}
          />
        ) : (
          <WithoutListItems profileSlug={profileSlug} listSlug={list.slug} />
        )}
      </div>

      {/* Edit List Sheet Form */}
      <SheetForm
        isOpen={isSheetOpen}
        onClose={handleCancel}
        title="Edit List"
        description="Edit your wish list"
      >
        <EditListForm
          profileSlug={profileSlug}
          list={list}
          onFormSubmit={handleSubmit}
          onFormCancel={handleCancel}
        />
      </SheetForm>

      {/* Share List Dialog Form */}
      <DialogForm
        isOpen={isDialogOpen}
        onClose={handleDialogCancel}
        title="Share your list"
        description="Send your list to friends and family so they can help you celebrate!"
      >
        <ShareListForm
          profileSlug={profileSlug}
          list={list}
          onFormSubmit={handleDialogSubmit}
          onFormCancel={handleDialogCancel}
        />
      </DialogForm>
    </div>
  )
}
