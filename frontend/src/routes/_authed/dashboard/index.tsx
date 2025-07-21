import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { listQueryOptions } from '@/services/list.api'

import { ListsSkeleton } from '@/components/ui/lists-skeleton'
import { WithLists } from '@/components/dashboard/index/with-lists'
import { WithoutLists } from '@/components/dashboard/index/without-lists'

export const Route = createFileRoute('/_authed/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { profileId } = Route.useRouteContext()

  const {
    data: lists,
    isLoading,
    isError,
  } = useQuery(listQueryOptions(profileId))

  const hasLists = lists && lists.length > 0

  if (isError) {
    return <div>Error loading lists</div>
  }

  return (
    <div className="flex h-full px-8">
      {isLoading ? (
        <ListsSkeleton />
      ) : hasLists ? (
        <WithLists lists={lists} />
      ) : (
        <WithoutLists profileId={profileId} />
      )}
    </div>
  )
}
