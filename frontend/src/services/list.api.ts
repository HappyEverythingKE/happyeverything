import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  ErrorResponse,
  List,
  ListStatusType,
  ListType,
  SuccessResponse,
} from '@shared/types'

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

export const listsByProfileQueryOptions = (profileSlug: string) =>
  queryOptions({
    queryKey: ['profiles', profileSlug, 'lists'],
    queryFn: () => getListsByProfile(profileSlug!),
    enabled: !!profileSlug,
  })

export const createList = async (
  profileSlug: string,
  listData: Partial<List>,
) => {
  const res = await client.lists[profileSlug].$post({
    form: listData,
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<List>
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  return data
}

export const useCreateList = (profileSlug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: Partial<List>) => createList(profileSlug, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['profiles', profileSlug, 'lists'],
      })
    },
  })
}

export const fetchList = async (profileSlug: string, listSlug: string) => {
  const res = await client.lists[profileSlug][listSlug].$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<List>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch list')
}

export const fetchListQueryOptions = (profileSlug: string, listSlug: string) =>
  queryOptions({
    queryKey: ['profiles', profileSlug, 'lists', listSlug],
    queryFn: () => fetchList(profileSlug, listSlug),
    enabled: !!profileSlug && !!listSlug,
  })

export const updateList = async (
  profileSlug: string,
  listSlug: string,
  listData: Partial<List>,
) => {
  const res = await client.lists[profileSlug][listSlug].$patch({
    form: listData,
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<List>
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  return data
}

export const useUpdateList = (profileSlug: string, listSlug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: Partial<List>) =>
      updateList(profileSlug, listSlug, values),
    onSuccess: async (res) => {
      if (!res.success) return // let the form handle the error

      const updatedList = res.data
      // update detail
      queryClient.setQueryData<List>(
        ['profiles', profileSlug, 'lists', listSlug],
        updatedList,
      )
      // update collection (optimistic patch)
      queryClient.setQueryData<List[]>(
        ['profiles', profileSlug, 'lists'],
        (old) =>
          old
            ? old.map((list) => (list.slug === listSlug ? updatedList : list))
            : old,
      )
    },
  })
}

export const updateListStatus = async (
  profileSlug: string,
  listSlug: string,
  status: ListStatusType,
) => {
  const res = await client.lists[profileSlug][listSlug].status.$patch({
    json: { status },
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<List>
    return data
  }

  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to update list status')
}

export const useUpdateListStatus = (profileSlug: string, listSlug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: ListStatusType) =>
      updateListStatus(profileSlug, listSlug, status),
    onSuccess: (res) => {
      const updatedList = res.data
      // update detail
      queryClient.setQueryData(
        ['profiles', profileSlug, 'lists', listSlug],
        updatedList,
      )

      // update collection (optimistic patch)
      queryClient.setQueryData<List[]>(
        ['profiles', profileSlug, 'lists'],
        (old) =>
          old
            ? old.map((list) =>
                list.slug === listSlug
                  ? { ...list, status: updatedList.status }
                  : list,
              )
            : old,
      )
    },
  })
}

export const shareList = async (
  profileSlug: string,
  listSlug: string,
  listData: Partial<List>,
) => {
  const res = await client.lists[profileSlug][listSlug].share.$patch({
    form: listData,
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<List>
    return data
  }
  const data = (await res.json()) as unknown as ErrorResponse
  return data
}

export const useShareList = (profileSlug: string, listSlug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: Partial<List>) =>
      shareList(profileSlug, listSlug, values),
    onSuccess: (res) => {
      if (!res.success) return // let the form handle the error

      const updatedList = res.data
      // update detail
      queryClient.setQueryData<List>(
        ['profiles', profileSlug, 'lists', listSlug],
        updatedList,
      )

      // update collection
      queryClient.setQueryData<List[]>(
        ['profiles', profileSlug, 'lists'],
        (old) =>
          old
            ? old.map((list) => (list.slug === listSlug ? updatedList : list))
            : old,
      )
    },
  })
}

export const deleteList = async (profileSlug: string, listSlug: string) => {
  const res = await client.lists[profileSlug][listSlug].$delete({})

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to delete the list')
  }
}

export const useDeleteList = (profileSlug: string, listSlug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteList(profileSlug, listSlug),
    onSuccess: () => {
      // remove from detail cache
      queryClient.removeQueries({
        queryKey: ['profiles', profileSlug, 'lists', listSlug],
      })
      // patch the lists collection
      queryClient.setQueryData<List[]>(
        ['profiles', profileSlug, 'lists'],
        (old) => old?.filter((list) => list.slug !== listSlug),
      )
    },
  })
}

export const getListTypes = async () => {
  const res = await client.lists['list-types'].$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<ListType[]>
    return data
  }
  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch list types')
}

export const listTypesQueryOptions = () =>
  queryOptions({
    queryKey: ['list-types'],
    queryFn: () => getListTypes(),
  })
