import { useEffect } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { publicListsQueryOptions } from '@/services/public.api'
import { toast } from 'sonner'
import { z } from 'zod'

import { FullPageSkeleton } from '@/components/ui/full-page-skeleton'
import { EmptyListsState } from '@/components/public/empty-lists-state'
import { ProfileHeader } from '@/components/public/profile-header'
import { ProfileListsOverview } from '@/components/public/profile-lists-overview'

const searchSchema = z.object({
  error: z.string().optional(),
})
export const Route = createFileRoute('/_public/$profileSlug/')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context, params }) => {
    const queryClient = context.queryClient
    const profileSlug = params.profileSlug

    try {
      await queryClient.ensureQueryData(publicListsQueryOptions(profileSlug))
    } catch (error) {
      toast.error('Error loading profile', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
      throw redirect({
        to: '/',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { error } = Route.useSearch()
  const { profileSlug } = Route.useParams()

  const { data, isLoading } = useSuspenseQuery(
    publicListsQueryOptions(profileSlug),
  )

  // show error toast if redirected from failed list load
  useEffect(() => {
    if (error === 'public-list-not-found') {
      toast.error('List Not Found', {
        description: 'This list could not be found',
      })
    }
  }, [error])

  if (isLoading) {
    return <FullPageSkeleton variant="profile" />
  }

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
