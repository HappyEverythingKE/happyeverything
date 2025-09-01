import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { publicListsQueryOptions } from '@/services/public.api'

import { ProfileHeader } from '@/components/public/profile-header'
import { WithPublicLists } from '@/components/public/with-public-lists'
import { WithoutPublicLists } from '@/components/public/without-public-lists'

export const Route = createFileRoute('/_public/$profileSlug/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { profileSlug } = Route.useParams()
  const { data } = useSuspenseQuery(publicListsQueryOptions(profileSlug))

  return (
    <div className="mx-auto min-h-screen px-[5%] pt-8">
      <ProfileHeader listOwner={data.listOwner} />
      {data.lists.length === 0 ? (
        <WithoutPublicLists />
      ) : (
        <WithPublicLists profileSlug={profileSlug} lists={data.lists} />
      )}
    </div>
  )
}
