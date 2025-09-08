import { useRouter } from '@tanstack/react-router'
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
    queryKey: [profileSlug, 'lists'],
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
  const router = useRouter()

  return useMutation({
    mutationFn: (values: Parameters<typeof createList>[1]) =>
      createList(profileSlug, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [profileSlug, 'lists'] })
      router.invalidate()
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
    queryKey: [profileSlug, 'lists', listSlug],
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
  const router = useRouter()

  return useMutation({
    mutationFn: (values: Parameters<typeof updateList>[2]) =>
      updateList(profileSlug, listSlug, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [profileSlug, 'lists', listSlug],
      })
      await queryClient.invalidateQueries({ queryKey: [profileSlug, 'lists'] })
      router.invalidate()
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
  const router = useRouter()

  return useMutation({
    mutationFn: (status: ListStatusType) =>
      updateListStatus(profileSlug, listSlug, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileSlug, 'lists', listSlug],
      })
      queryClient.invalidateQueries({ queryKey: [profileSlug, 'lists'] })
      router.invalidate()
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
  const router = useRouter()

  return useMutation({
    mutationFn: (values: Parameters<typeof shareList>[2]) =>
      shareList(profileSlug, listSlug, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileSlug, 'lists', listSlug],
      })
      queryClient.invalidateQueries({ queryKey: [profileSlug, 'lists'] })
      router.invalidate()
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
  const router = useRouter()

  return useMutation({
    mutationFn: () => deleteList(profileSlug, listSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileSlug, 'lists', listSlug],
      })
      queryClient.invalidateQueries({ queryKey: [profileSlug, 'lists'] })
      router.invalidate()
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
