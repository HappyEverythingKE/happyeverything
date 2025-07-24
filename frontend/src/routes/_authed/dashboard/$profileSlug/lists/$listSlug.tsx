import { createFileRoute } from '@tanstack/react-router'

import { singleListQueryOptions } from '@/services/list.api'
import { Edit } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute(
  '/_authed/dashboard/$profileSlug/lists/$listSlug',
)({
  loader: async ({ context, params }) => {
    const list = await context.queryClient.fetchQuery(
      singleListQueryOptions(params.profileSlug, params.listSlug),
    )
    return { list }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { list } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* List header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium">{list.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{list.status}</Badge>
            <Badge variant={list.private ? 'secondary' : 'outline'}>
              {list.private ? 'Private' : 'Public'}
            </Badge>
          </div>
        </div>
        <Button size="icon" variant="ghost">
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {/* List items grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* List items will go here */}
      </div>
    </div>
  )
}
