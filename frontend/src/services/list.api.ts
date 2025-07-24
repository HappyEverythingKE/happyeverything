import { queryOptions, useMutation } from '@tanstack/react-query'

import type { ErrorResponse, List, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

export const getListsByProfile = async (profileSlug: string) => {
  const res = await client.lists[profileSlug].$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<List[]>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch lists')
}

export const profileListsQueryOptions = (profileSlug: string) =>
  queryOptions({
    queryKey: [profileSlug, 'lists'],
    queryFn: () => getListsByProfile(profileSlug!),
    enabled: !!profileSlug,
  })

export const postList = async (
  profileSlug: string,
  listData: Partial<List>,
) => {
  try {
    const res = await client.lists[profileSlug].$post({
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

export function useCreateList(profileSlug: string) {
  return useMutation({
    mutationFn: (values: Parameters<typeof postList>[1]) =>
      postList(profileSlug, values),
  })
}

export const fetchList = async (profileSlug: string, listSlug: string) => {
  const res = await client.lists[profileSlug].lists[listSlug].$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<List>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch list')
}

export const singleListQueryOptions = (profileSlug: string, listSlug: string) =>
  queryOptions({
    queryKey: ['listDetail', profileSlug, listSlug],
    queryFn: () => fetchList(profileSlug, listSlug),
    enabled: !!profileSlug && !!listSlug,
  })
