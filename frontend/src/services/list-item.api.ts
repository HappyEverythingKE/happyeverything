import { useRouter } from '@tanstack/react-router'
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
  const res = await client.lists[profileSlug][listSlug].items.$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<ListItem[]>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch list items')
}

export const listItemsQueryOptions = (profileSlug: string, listSlug: string) =>
  queryOptions({
    queryKey: [profileSlug, listSlug, 'items'],
    queryFn: () => getListItemsByList(profileSlug, listSlug),
    enabled: !!profileSlug && !!listSlug,
  })

export const createListItem = async (
  profileSlug: string,
  listSlug: string,
  listItemData: Partial<ListItem>,
) => {
  try {
    const res = await client.lists[profileSlug][listSlug].items.$post({
      form: listItemData,
    })

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse<ListItem>
      return data
    }
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to create item')
  } catch (error) {
    return {
      success: false,
      error: String(error),
      isFormError: false,
    } as ErrorResponse
  }
}

export const useCreateListItem = (profileSlug: string, listSlug: string) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (listItemData: Partial<ListItem>) =>
      createListItem(profileSlug, listSlug, listItemData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileSlug, listSlug, 'items'],
      })
      router.invalidate()
    },
  })
}

export const fetchListItem = async (
  profileSlug: string,
  listSlug: string,
  itemId: string,
) => {
  const res = await client.lists[profileSlug][listSlug].items[itemId].$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<ListItem>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch item')
}

export const fetchListItemQueryOptions = (
  profileSlug: string,
  listSlug: string,
  itemId: string,
) =>
  queryOptions({
    queryKey: [profileSlug, listSlug, 'items', itemId],
    queryFn: () => fetchListItem(profileSlug, listSlug, itemId),
    enabled: !!profileSlug && !!listSlug && !!itemId,
  })

export const updateListItem = async (
  profileSlug: string,
  listSlug: string,
  itemId: string,
  listItemData: Partial<ListItem>,
) => {
  try {
    const res = await client.lists[profileSlug][listSlug].items[itemId].$patch({
      form: listItemData,
    })

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse<ListItem>
      return data
    }
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to update item')
  } catch (error) {
    return {
      success: false,
      error: String(error),
      isFormError: false,
    } as ErrorResponse
  }
}

export const useUpdateListItem = (
  profileSlug: string,
  listSlug: string,
  itemId: string,
) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (listItemData: Partial<ListItem>) =>
      updateListItem(profileSlug, listSlug, itemId, listItemData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileSlug, listSlug, 'items', itemId],
      })
      queryClient.invalidateQueries({
        queryKey: [profileSlug, listSlug, 'items'],
      })
      router.invalidate()
    },
  })
}

export const updateListItemPriority = async (
  profileSlug: string,
  listSlug: string,
  itemId: string,
  topPick: boolean,
) => {
  const res = await client.lists[profileSlug][listSlug].items[
    itemId
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
  itemId: string,
) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (topPick: boolean) =>
      updateListItemPriority(profileSlug, listSlug, itemId, topPick),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileSlug, listSlug, 'items', itemId],
      })
      queryClient.invalidateQueries({
        queryKey: [profileSlug, listSlug, 'items'],
      })
      router.invalidate()
    },
  })
}

export const deleteListItem = async (
  profileSlug: string,
  listSlug: string,
  itemId: string,
) => {
  const res = await client.lists[profileSlug][listSlug].items[itemId].$delete(
    {},
  )

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to delete item')
  }
}

export const useDeleteListItem = (
  profileSlug: string,
  listSlug: string,
  itemId: string,
) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () => deleteListItem(profileSlug, listSlug, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileSlug, listSlug, 'items', itemId],
      })
      queryClient.invalidateQueries({
        queryKey: [profileSlug, listSlug, 'items'],
      })
      router.invalidate()
    },
  })
}
