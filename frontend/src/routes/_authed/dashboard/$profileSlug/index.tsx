import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { profileListsQueryOptions } from '@/services/list.api'

import { ListsSkeleton } from '@/components/ui/lists-skeleton'
import { WithLists } from '@/components/dashboard/index/with-lists'
import { WithoutLists } from '@/components/dashboard/index/without-lists'

export const Route = createFileRoute('/_authed/dashboard/$profileSlug/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { profile } = Route.useRouteContext()

  const {
    data: lists,
    isLoading,
    isError,
  } = useQuery(profileListsQueryOptions(profile.slug))

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
        <WithoutLists profileSlug={profile.slug} />
      )}
    </div>
  )
}
