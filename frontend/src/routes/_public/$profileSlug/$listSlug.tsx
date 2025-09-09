import { createFileRoute, redirect } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { fetchPublicListQueryOptions } from '@/services/public.api'
import { toast } from 'sonner'

import { FullPageSkeleton } from '@/components/ui/full-page-skeleton'
import { EmptyListsState } from '@/components/public/empty-lists-state'
import { ListDetail } from '@/components/public/list-detail'
import { ListDetailHeader } from '@/components/public/list-detail-header'

export const Route = createFileRoute('/_public/$profileSlug/$listSlug')({
  beforeLoad: async ({ context, params }) => {
    const queryClient = context.queryClient
    const profileSlug = params.profileSlug
    const listSlug = params.listSlug

    try {
      await queryClient.ensureQueryData(
        fetchPublicListQueryOptions(profileSlug, listSlug),
      )
    } catch (error) {
      toast.error('Error loading list', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
      throw redirect({
        to: '/$profileSlug',
        params: { profileSlug },
        search: { error: 'public-list-not-found' },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { profileSlug, listSlug } = Route.useParams()
  const { data, isLoading } = useSuspenseQuery(
    fetchPublicListQueryOptions(profileSlug, listSlug),
  )

  if (isLoading) {
    return <FullPageSkeleton variant="profile" />
  }

  const listInfo = {
    name: data.list.name,
    description: data.list.description || '',
    createdAt: data.list.createdAt,
  }

  return (
    <div className="mx-auto min-h-svh">
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
