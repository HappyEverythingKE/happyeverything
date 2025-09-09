import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { listsByProfileQueryOptions } from '@/services/list.api'
import { toast } from 'sonner'
import { z } from 'zod'

import { ListsSkeleton } from '@/components/ui/lists-skeleton'
import { WithLists } from '@/components/dashboard/index/with-lists'
import { WithoutLists } from '@/components/dashboard/index/without-lists'

const searchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/_authed/dashboard/$profileSlug/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { selectedProfile } = Route.useRouteContext()
  const { error } = Route.useSearch()

  const {
    data: lists,
    isLoading,
    isError,
  } = useQuery(listsByProfileQueryOptions(selectedProfile.slug))

  // show error toast if redirected from failed list load
  useEffect(() => {
    if (error === 'list-not-found') {
      toast.error('List not found', {
        description: 'This list could not be found',
      })
    }
  }, [error])

  const hasLists = lists && lists.length > 0

  if (isError) {
    return <div>Error loading lists</div>
  }

  return (
    <div className="flex h-full px-8">
      {isLoading ? (
        <ListsSkeleton />
      ) : hasLists ? (
        <WithLists profileSlug={selectedProfile.slug} lists={lists} />
      ) : (
        <WithoutLists profileSlug={selectedProfile.slug} />
      )}
    </div>
  )
}
