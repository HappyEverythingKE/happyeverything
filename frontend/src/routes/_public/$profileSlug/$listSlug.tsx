import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { fetchPublicListQueryOptions } from '@/services/public.api'
import { startCase } from 'lodash'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { FullPageSkeleton } from '@/components/ui/full-page-skeleton'
import { PublicListPasswordForm } from '@/components/dashboard/forms/public-list-password-form'
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
      toast.error('An error occured.', {
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
  console.log('data', data)

  if (isLoading) {
    return <FullPageSkeleton variant="profile" />
  }

  // render password form if list is private
  if ('privateList' in data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 px-[5%]">
        <div className="mb-8 flex flex-col items-center justify-center space-y-1 text-center md:mb-16">
          <h1 className="text-2xl md:text-4xl">
            {startCase(data.privateList.name)}
          </h1>
          <Button
            variant="link"
            asChild
            className="gap-2 px-0 text-base font-medium"
          >
            <Link
              className="underline underline-offset-2"
              to="/$profileSlug"
              params={{ profileSlug: data.listOwner.profileSlug }}
            >
              By {data.listOwner.name}
            </Link>
          </Button>
        </div>
        <p className="text-balance text-center">
          This is a private list.
          <br />
          Enter the password to access it.
        </p>
        <PublicListPasswordForm profileSlug={profileSlug} listSlug={listSlug} />
      </div>
    )
  }

  // render public list
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
