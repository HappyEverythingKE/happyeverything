import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

import { listsByProfileQueryOptions } from '@/services/list.api'
import { fetchProfileQueryOptions } from '@/services/profile.api'
import { toast } from 'sonner'
import { z } from 'zod'

import { FullPageSkeleton } from '@/components/ui/full-page-skeleton'
import { WithLists } from '@/components/dashboard/index/with-lists'
import { WithoutLists } from '@/components/dashboard/index/without-lists'
import { ErrorComponent } from '@/components/error-component'

const searchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/_authed/dashboard/$profileSlug/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { profileSlug } = Route.useParams()
  const { data: selectedProfile } = useSuspenseQuery(
    fetchProfileQueryOptions(profileSlug),
  )

  const { error } = Route.useSearch()

  const {
    data: lists,
    isLoading,
    isError,
  } = useQuery(listsByProfileQueryOptions(selectedProfile.slug))

  // show error toast if redirected from failed list load
  useEffect(() => {
    if (error === 'list-not-found') {
      toast.error('List Not Found', {
        description: 'This list could not be found',
      })
    }
  }, [error])

  const hasLists = lists && lists.length > 0

  if (isError) {
    return <ErrorComponent error={new Error('Error loading lists')} />
  }

  if (isLoading) {
    return <FullPageSkeleton variant="dashboard" />
  }

  return (
    <div className="flex h-full px-8">
      {hasLists ? (
        <WithLists profileSlug={selectedProfile.slug} lists={lists} />
      ) : (
        <WithoutLists profileSlug={selectedProfile.slug} />
      )}
    </div>
  )
}
