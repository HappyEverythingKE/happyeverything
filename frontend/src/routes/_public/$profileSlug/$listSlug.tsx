import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

import {
  fetchPublicListQueryOptions,
  unlockedListQueryOptions,
} from '@/services/public.api'
import type { ListWithItems } from '@shared/types'
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
  pendingComponent: () => {
    return (
      <div className="mx-auto py-10">
        <FullPageSkeleton variant="profile" />
      </div>
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { profileSlug, listSlug } = Route.useParams()

  const { data } = useSuspenseQuery(
    fetchPublicListQueryOptions(profileSlug, listSlug),
  )

  // subscribe reactively to unlockedList
  const { data: unlockedList } = useQuery(
    unlockedListQueryOptions(profileSlug, listSlug),
  )

  // private list, not yet unlocked
  if ('privateList' in data && !unlockedList) {
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

  // at this point we either have a public list OR an unlocked private list
  const list = unlockedList ?? (data as { list: ListWithItems }).list

  const listInfo = {
    name: list.name,
    description: list.description || '',
    createdAt: list.createdAt,
  }

  return (
    <div className="mx-auto min-h-svh">
      <ListDetailHeader listOwner={data.listOwner} listInfo={listInfo} />
      {list.items.length === 0 ? (
        <EmptyListsState description="This list has no items yet. Check back later!" />
      ) : (
        <ListDetail list={list} />
      )}
    </div>
  )
}
