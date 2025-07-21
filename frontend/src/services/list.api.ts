import { queryOptions, useMutation } from '@tanstack/react-query'

import type { ErrorResponse, List, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

export const getListsByProfileId = async (profileId: string) => {
  const res = await client.lists[profileId].$get({})

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to fetch lists')
  }

  const { data } = (await res.json()) as SuccessResponse<{ lists: List[] }>
  return data.lists
}

export const listQueryOptions = (profileId: string) =>
  queryOptions({
    queryKey: ['lists', profileId],
    queryFn: () => getListsByProfileId(profileId!),
    enabled: !!profileId,
  })

export const postList = async (profileId: string, listData: Partial<List>) => {
  try {
    const res = await client.lists[profileId].$post({
      form: listData,
    })

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse<List>
      return data
    }

    const data = (await res.json()) as unknown as ErrorResponse
    return data
  } catch (error) {
    return {
      success: false,
      error: String(error),
      isFormError: false,
    } as ErrorResponse
  }
}

export function useCreateList(profileId: string) {
  return useMutation({
    mutationFn: (values: Parameters<typeof postList>[1]) =>
      postList(profileId, values),
  })
}
