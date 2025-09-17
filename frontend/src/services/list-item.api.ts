import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { ErrorResponse, ListItem, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

export const getListItemsByList = async (
  profileSlug: string,
  listSlug: string,
) => {
  const res = await (client.lists as any)[profileSlug][listSlug].items.$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<ListItem[]>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch list items')
}

export const listItemsQueryOptions = (profileSlug: string, listSlug: string) =>
  queryOptions({
    queryKey: ['profiles', profileSlug, 'lists', listSlug, 'items'],
    queryFn: () => getListItemsByList(profileSlug, listSlug),
    enabled: !!profileSlug && !!listSlug,
  })

export const createListItem = async (
  profileSlug: string,
  listSlug: string,
  listItemData: Partial<ListItem>,
) => {
  const res = await (client.lists as any)[profileSlug][listSlug].items.$post({
    form: listItemData,
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<ListItem>
    return data
  }

  const data = (await res.json()) as ErrorResponse
  return data
}

export const useCreateListItem = (profileSlug: string, listSlug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listItemData: Partial<ListItem>) =>
      createListItem(profileSlug, listSlug, listItemData),
    onSuccess: async (res) => {
      if (!res.success) return // let the form handle the error

      const newItem = res.data

      // patch and re-sort collection cache (optimistic patch)
      queryClient.setQueryData<ListItem[]>(
        ['profiles', profileSlug, 'lists', listSlug, 'items'],
        (old) =>
          old
            ? [...old, newItem].sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
            : [newItem],
      )

      // update detail
      queryClient.setQueryData<ListItem>(
        ['profiles', profileSlug, 'lists', listSlug, 'items', newItem.publicId],
        newItem,
      )

      // kick off background refetch so UI is in sync incase another user is updating the same list concurrently
      await queryClient.invalidateQueries({
        queryKey: ['profiles', profileSlug, 'lists', listSlug, 'items'],
      })
    },
  })
}

export const updateListItem = async (
  profileSlug: string,
  listSlug: string,
  itemPublicId: string,
  listItemData: Partial<ListItem>,
) => {
  const res = await (client.lists as any)[profileSlug][listSlug].items[
    itemPublicId
  ].$patch({
    form: listItemData,
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<ListItem>
    return data
  }

  const data = (await res.json()) as ErrorResponse
  return data
}

export const useUpdateListItem = (
  profileSlug: string,
  listSlug: string,
  itemPublicId: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listItemData: Partial<ListItem>) =>
      updateListItem(profileSlug, listSlug, itemPublicId, listItemData),
    onSuccess: (res) => {
      if (!res.success) return // let the form handle the error

      const updatedItem = res.data
      // update detail
      queryClient.setQueryData<ListItem>(
        ['profiles', profileSlug, 'lists', listSlug, 'items', itemPublicId],
        updatedItem,
      )

      // update collection
      queryClient.setQueryData<ListItem[]>(
        ['profiles', profileSlug, 'lists', listSlug, 'items'],
        (old) =>
          old
            ? old.map((item) =>
                item.publicId === itemPublicId ? updatedItem : item,
              )
            : old,
      )
    },
  })
}

export const updateListItemPriority = async (
  profileSlug: string,
  listSlug: string,
  itemPublicId: string,
  topPick: boolean,
) => {
  const res = await (client.lists as any)[profileSlug][listSlug].items[
    itemPublicId
  ].priority.$patch({
    form: { topPick: Boolean(topPick) },
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<ListItem>
    return data
  }

  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to update top pick status')
}

export const useUpdateListItemPriority = (
  profileSlug: string,
  listSlug: string,
  itemPublicId: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (topPick: boolean) =>
      updateListItemPriority(profileSlug, listSlug, itemPublicId, topPick),
    onSuccess: (res) => {
      const updatedItem = res.data

      // update detail
      queryClient.setQueryData<ListItem>(
        ['profiles', profileSlug, 'lists', listSlug, 'items', itemPublicId],
        updatedItem,
      )

      // update collection (optimistic patch + re-sort) instead of re-fetching from server
      queryClient.setQueryData<ListItem[]>(
        ['profiles', profileSlug, 'lists', listSlug, 'items'],
        (old) =>
          old
            ? old
                .map((item) =>
                  item.publicId === itemPublicId ? updatedItem : item,
                )
                .sort((a, b) => {
                  // topPicks first
                  if (a.topPick !== b.topPick) {
                    return a.topPick ? -1 : 1
                  }
                  // then by createdAt (desc)
                  return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                  )
                })
            : old,
      )
    },
  })
}

export const deleteListItem = async (
  profileSlug: string,
  listSlug: string,
  itemPublicId: string,
) => {
  const res = await (client.lists as any)[profileSlug][listSlug].items[
    itemPublicId
  ].$delete({})

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to delete item')
  }
}

export const useDeleteListItem = (
  profileSlug: string,
  listSlug: string,
  itemPublicId: string,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteListItem(profileSlug, listSlug, itemPublicId),
    onSuccess: () => {
      // remove from detail cache
      queryClient.removeQueries({
        queryKey: [
          'profiles',
          profileSlug,
          'lists',
          listSlug,
          'items',
          itemPublicId,
        ],
      })
      // patch the collection
      queryClient.setQueryData<ListItem[]>(
        ['profiles', profileSlug, 'lists', listSlug, 'items'],
        (old) => old?.filter((item) => item.publicId !== itemPublicId),
      )
    },
  })
}
