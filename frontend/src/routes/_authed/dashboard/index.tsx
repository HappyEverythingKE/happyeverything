import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { listQueryOptions } from '@/services/list.api'

import { WithLists } from '@/components/dashboard/index/with-lists'
import { WithoutLists } from '@/components/dashboard/index/without-lists'

export const Route = createFileRoute('/_authed/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const profile = user.profiles[0] // most recent is first
  const profileId = profile?.id

  const {
    data: lists,
    isLoading,
    isError,
  } = useQuery(listQueryOptions(profileId))

  const hasLists = lists && lists.length > 0

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error loading lists</div>
  }
  return (
    <div className="flex h-full px-8">
      {hasLists ? <WithLists lists={lists} /> : <WithoutLists />}
    </div>
    // <div className="grid grid-cols-1 gap-6 px-8 py-4 lg:grid-cols-3 lg:gap-9">
    //   {hasLists ? <WithLists lists={lists} /> : <WithoutLists />}
    // </div>
  )
}
