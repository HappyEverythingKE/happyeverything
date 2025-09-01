import { useRouter } from '@tanstack/react-router'
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
  const res = await client.public[profileSlug].$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<{
      listOwner: PublicListOwner
      lists: List[]
    }>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch lists')
}

export const publicListsQueryOptions = (profileSlug: string) =>
  queryOptions({
    queryKey: ['publicLists', profileSlug],
    queryFn: () => getPublicLists(profileSlug!),
    enabled: !!profileSlug,
  })

export const getPublicList = async (profileSlug: string, listSlug: string) => {
  const res = await client.public[profileSlug][listSlug].$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<ListWithItems>
    console.log('FE list detail', data)
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch list')
}

export const publicListQueryOptions = (profileSlug: string, listSlug: string) =>
  queryOptions({
    queryKey: ['publicList', profileSlug, listSlug],
    queryFn: () => getPublicList(profileSlug!, listSlug!),
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
    const { data } = (await res.json()) as SuccessResponse<ListWithItems>
    console.log('FE checkPublicListPassword', data)
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
  const router = useRouter()

  return useMutation({
    mutationFn: (password: string) =>
      checkPublicListPassword(profileSlug!, listSlug!, password),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['publicList', profileSlug, listSlug],
      })
      router.invalidate()
    },
  })
}
