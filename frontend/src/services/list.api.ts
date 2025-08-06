import { useRouter } from '@tanstack/react-router'
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  ErrorResponse,
  List,
  StatusType,
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

export const useCreateList = (profileSlug: string) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (values: Parameters<typeof postList>[1]) =>
      postList(profileSlug, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [profileSlug, 'lists'] })
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

export const singleListQueryOptions = (profileSlug: string, listSlug: string) =>
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
  try {
    const res = await client.lists[profileSlug][listSlug].$patch({
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

export const useUpdateList = (profileSlug: string, listSlug: string) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (values: Parameters<typeof updateList>[2]) =>
      updateList(profileSlug, listSlug, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileSlug, 'lists', listSlug],
      })
      queryClient.invalidateQueries({ queryKey: [profileSlug, 'lists'] })
      router.invalidate()
    },
  })
}

export const updateListStatus = async (
  profileSlug: string,
  listSlug: string,
  status: StatusType,
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
    mutationFn: (status: StatusType) =>
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

export const deleteList = async (profileSlug: string, listSlug: string) => {
  const res = await client.lists[profileSlug][listSlug].$delete({})

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to delete list')
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
