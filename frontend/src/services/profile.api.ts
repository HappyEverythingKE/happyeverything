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
})

export const fetchProfile = async (profileSlug: string) => {
  const res = await client.profile[':profileSlug'].$get({
    param: {
      profileSlug,
    },
  })

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<Profile>
    return data
  }
  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch profile')
}

export const fetchProfileQueryOptions = (profileSlug: string) =>
  queryOptions({
    queryKey: ['profiles', profileSlug],
    queryFn: () => fetchProfile(profileSlug),
    enabled: !!profileSlug,
  })

export const postProfile = async (slug: string) => {
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
  throw new Error(data.error ?? 'Failed to create profile')
}

export const useCreateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postProfile,
    onSuccess: async (res) => {
      if (!res.success) return // let the form handle the error

      queryClient.setQueryData(['profiles', res.data.slug], res.data)
      queryClient.setQueryData(['profiles'], (old: Profile[]) => [
        ...old,
        res.data,
      ])
      await queryClient.invalidateQueries({ queryKey: ['account'] })
    },
  })
}

export const patchProfile = async (currentSlug: string, newSlug: string) => {
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
      queryClient.setQueryData(['profiles', res.data.slug], res.data)
      queryClient.setQueryData(['profiles'], (old: Profile[]) =>
        old
          ? old.map((profile) =>
              profile.slug === res.data.slug ? res.data : profile,
            )
          : old,
      )
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
