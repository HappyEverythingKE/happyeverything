import { queryOptions } from '@tanstack/react-query'

import type { ErrorResponse, List, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

export const getListsByProfileId = async (profileId: string) => {
  const res = await client.lists[profileId].$get({})

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to fetch lists')
  }

  const { data } = (await res.json()) as SuccessResponse<{ lists: List[] }>

  console.log('getListsByProfileId:', profileId, data)
  return data.lists
}

export const listQueryOptions = (profileId: string) =>
  queryOptions({
    queryKey: ['lists', profileId],
    queryFn: () => getListsByProfileId(profileId!),
    enabled: !!profileId,
  })
