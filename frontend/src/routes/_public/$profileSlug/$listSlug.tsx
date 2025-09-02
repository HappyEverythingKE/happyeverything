import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { publicListQueryOptions } from '@/services/public.api'

import { EmptyListsState } from '@/components/public/empty-lists-state'
import { ListDetail } from '@/components/public/list-detail'
import { ListDetailHeader } from '@/components/public/list-detail-header'

export const Route = createFileRoute('/_public/$profileSlug/$listSlug')({
  component: RouteComponent,
})

function RouteComponent() {
  const { profileSlug, listSlug } = Route.useParams()
  const { data } = useSuspenseQuery(
    publicListQueryOptions(profileSlug, listSlug),
  )

  const listInfo = {
    name: data.list.name,
    description: data.list.description || '',
  }
  return (
    <div className="mx-auto min-h-screen">
      <ListDetailHeader listOwner={data.listOwner} listInfo={listInfo} />
      {data.list.items.length === 0 ? (
        <EmptyListsState
          description={'This list has no items yet. Check back later!'}
        />
      ) : (
        <ListDetail list={data.list} />
      )}
    </div>
  )
}
