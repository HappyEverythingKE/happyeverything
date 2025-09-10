import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  ErrorResponse,
  List,
  ListWithItems,
  PublicListOwner,
  PublicListResponse,
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'

export const getPublicLists = async (profileSlug: string) => {
  const res = await client.public[profileSlug].$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<{
      listOwner: PublicListOwner
      lists: Omit<List, 'password'>[]
    }>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch lists')
}

export const publicListsQueryOptions = (profileSlug: string) =>
  queryOptions({
    queryKey: ['publicProfiles', profileSlug],
    queryFn: () => getPublicLists(profileSlug!),
    enabled: !!profileSlug,
  })

export const fetchPublicList = async (
  profileSlug: string,
  listSlug: string,
): Promise<PublicListResponse> => {
  const res = await client.public[profileSlug][listSlug].$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<PublicListResponse>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch list')
}

export const fetchPublicListQueryOptions = (
  profileSlug: string,
  listSlug: string,
) =>
  queryOptions({
    queryKey: ['publicProfiles', profileSlug, 'lists', listSlug],
    queryFn: () => fetchPublicList(profileSlug!, listSlug!),
    enabled: !!profileSlug && !!listSlug,
  })

export const checkPublicListPassword = async (
  profileSlug: string,
  listSlug: string,
  password: string,
) => {
  const res = await client.public[profileSlug][listSlug].access.$post({
    form: { password },
  })

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<
      Omit<ListWithItems, 'password'>
    >
    return data
  }
  const data = (await res.json()) as ErrorResponse
  console.log('FE checkPublicListPassword error', data)
  throw new Error(data.error ?? 'Failed to check password')
}

export const useCheckPublicListPassword = (
  profileSlug: string,
  listSlug: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (password: string) =>
      checkPublicListPassword(profileSlug!, listSlug!, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['publicProfiles', profileSlug, 'lists', listSlug],
      })
    },
  })
}
