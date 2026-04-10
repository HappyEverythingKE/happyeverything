import { useEffect, useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { listItemsQueryOptions } from '@/services/list-item.api'
import { fetchListQueryOptions } from '@/services/list.api'
import { Settings, Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { useRealtimeListSync } from '@/hooks/use-realtime-list-sync'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

    try {
      const list = await context.queryClient.ensureQueryData(
        fetchListQueryOptions(profileSlug, listSlug),
      )
      return { profileSlug, list, crumb: list.name }
    } catch (error) {
      // handle 404 or other errors by redirecting to dashboard with error message
      console.error('Failed to load list:', error)

      // redirect to dashboard with error information in search params
      throw redirect({
        to: '/dashboard/$profileSlug',
        params: { profileSlug },
        search: { error: 'list-not-found' },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { profileSlug, list: initialList } = Route.useLoaderData()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const navigate = useNavigate()

  // use reactive query to get the latest list data
  const { data: list, error: listError } = useQuery({
    ...fetchListQueryOptions(profileSlug, initialList.slug),
    initialData: initialList, // Use loader data as initial data
  })

  // subscribe to realtime updates for the list
  useRealtimeListSync(profileSlug, list.slug, list.id)

  // handle case where list gets deleted while user is on the page
  useEffect(() => {
    if (listError) {
      toast.error('An error occurred', {
        description: 'This list is not available',
      })
      navigate({
        to: '/dashboard/$profileSlug',
        params: { profileSlug },
      })
    }
  }, [listError, navigate, profileSlug])

  // fetch list items
  const { data: listItems, isLoading } = useQuery(
    listItemsQueryOptions(profileSlug, list?.slug || initialList.slug),
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
      <div className="mb-4">
        {/* Title + description */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">{list.name}</h1>
          {list.description && (
            <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
              {list.description}
            </p>
          )}
        </div>

        {/* Badges + action buttons on the same row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="harbor" className="px-3 text-xs">
              {list.listType.name.toUpperCase()}
            </Badge>
            <Badge
              variant={
                list.status === 'published'
                  ? 'tangerine'
                  : list.status === 'draft'
                    ? 'coral'
                    : 'harbor'
              }
              className="px-3 text-xs"
            >
              {list.status.toUpperCase()}
            </Badge>
            {list.status === 'published' ? (
              <Badge
                variant={list.isPrivate ? 'blush' : 'dusk'}
                className="px-3 text-xs"
              >
                {list.isPrivate ? 'PRIVATE' : 'PUBLIC'}
              </Badge>
            ) : (
              <Badge variant="coral" className="px-3 text-xs">
                NOT PUBLISHED
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
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
      </div>

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
