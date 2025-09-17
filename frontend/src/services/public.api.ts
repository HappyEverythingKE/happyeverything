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
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'

export const getPublicLists = async (profileSlug: string) => {
  const res = await (client.public as any)[profileSlug].$get({})

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
) => {
  const res = await (client.public as any)[profileSlug][listSlug].$get({})
  const data = await res.json()

  if (!res.ok) {
    throw new Error((data as ErrorResponse).error ?? 'Failed to fetch list')
  }
  return (
    data as SuccessResponse<
      | { listOwner: PublicListOwner; list: ListWithItems }
      | {
          listOwner: PublicListOwner
          privateList: { name: string; slug: string; isPrivate: boolean }
        }
    >
  ).data
}

export const fetchPublicListQueryOptions = (
  profileSlug: string,
  listSlug: string,
) =>
  queryOptions({
    queryKey: ['publicListMeta', profileSlug, listSlug],
    queryFn: () => fetchPublicList(profileSlug!, listSlug!),
    enabled: !!profileSlug && !!listSlug,
  })

export const checkPublicListPassword = async (
  profileSlug: string,
  listSlug: string,
  password: string,
) => {
  const res = await (client.public as any)[profileSlug][listSlug].access.$post({
    form: { password },
  })

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<
      Omit<ListWithItems, 'password'>
    >
    return data
  }
  const data = (await res.json()) as ErrorResponse
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
    onSuccess: async (unlockedList) => {
      // store the unlocked data separately
      queryClient.setQueryData(
        ['unlockedList', profileSlug, listSlug],
        unlockedList,
      )
    },
  })
}

export const unlockedListQueryOptions = (
  profileSlug: string,
  listSlug: string,
) =>
  queryOptions<ListWithItems>({
    queryKey: ['unlockedList', profileSlug, listSlug],
    // no fetcher — this will only ever be populated via setQueryData
    queryFn: () => {
      throw new Error('No fetcher: unlockedList only comes from mutation')
    },
    enabled: false, // don’t auto-run
  })
