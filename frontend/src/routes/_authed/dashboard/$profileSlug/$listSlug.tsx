import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { singleListQueryOptions } from '@/services/list.api'
import { Edit } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SheetForm } from '@/components/ui/sheet-form'
import { EditListForm } from '@/components/dashboard/forms/edit-list-form'

export const Route = createFileRoute(
  '/_authed/dashboard/$profileSlug/$listSlug',
)({
  loader: async ({ context, params }) => {
    const { profileSlug, listSlug } = params
    const list = await context.queryClient.fetchQuery(
      singleListQueryOptions(profileSlug, listSlug),
    )
    return { profileSlug, list, crumb: list.name }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { profileSlug, list } = Route.useLoaderData()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleSubmit = () => {
    setIsSheetOpen(false)
  }

  const handleCancel = () => {
    setIsSheetOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* List header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium">{list.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{list.status}</Badge>
            <Badge variant={list.isPrivate ? 'secondary' : 'outline'}>
              {list.isPrivate ? 'Private' : 'Public'}
            </Badge>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsSheetOpen(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* List items grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* List items will go here */}
      </div>

      {/* Sheet Form */}
      <SheetForm isOpen={isSheetOpen} onClose={handleCancel} title="Edit List">
        <EditListForm
          profileSlug={profileSlug}
          list={list}
          onFormSubmit={handleSubmit}
          onFormCancel={handleCancel}
        />
      </SheetForm>
    </div>
  )
}
