import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { ErrorResponse, Profile, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

export const getProfiles = async () => {
  const res = await client.profile.$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<Profile[]>
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch profiles')
}

export const allProfilesQueryOptions = queryOptions({
  queryKey: ['profiles'],
  queryFn: getProfiles,
  staleTime: Infinity,
})

export const postProfile = async (slug: string) => {
  try {
    const res = await client.profile.$post({
      form: {
        slug,
      },
    })

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse<Profile>
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

export const useCreateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profiles'] })
      await queryClient.invalidateQueries({ queryKey: ['account'] })
    },
  })
}

export const patchProfile = async (currentSlug: string, newSlug: string) => {
  try {
    const res = await client.profile[':profileSlug'].$patch({
      param: {
        profileSlug: currentSlug,
      },
      form: {
        slug: newSlug,
      },
    })

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse<Profile>
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

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      currentSlug,
      newSlug,
    }: {
      currentSlug: string
      newSlug: string
    }) => patchProfile(currentSlug, newSlug),
    onSuccess: async (res) => {
      if (!res.success) return // let the form handle the error

      await queryClient.invalidateQueries({ queryKey: ['profiles'] })
      await queryClient.invalidateQueries({ queryKey: ['account'] })
    },
  })
}

export const deleteProfile = async (profileSlug: string) => {
  const res = await client.profile[':profileSlug'].$delete({
    param: {
      profileSlug,
    },
  })

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to delete profile')
  }
}

export const useDeleteProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profiles'] })
      await queryClient.invalidateQueries({ queryKey: ['account'] })
    },
  })
}
