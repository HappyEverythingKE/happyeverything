import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { publicListsQueryOptions } from '@/services/public.api'

import { EmptyListsState } from '@/components/public/empty-lists-state'
import { ProfileHeader } from '@/components/public/profile-header'
import { ProfileListsOverview } from '@/components/public/profile-lists-overview'

export const Route = createFileRoute('/_public/$profileSlug/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { profileSlug } = Route.useParams()
  const { data } = useSuspenseQuery(publicListsQueryOptions(profileSlug))

  return (
    <div className="mx-auto min-h-svh px-[5%] pt-8">
      <ProfileHeader listOwner={data.listOwner} />
      {data.lists.length === 0 ? (
        <EmptyListsState
          description={'This profile has no lists yet. Check back later!'}
        />
      ) : (
        <ProfileListsOverview profileSlug={profileSlug} lists={data.lists} />
      )}
    </div>
  )
}
