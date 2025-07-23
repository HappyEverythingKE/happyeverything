import type { ErrorResponse, Profile, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

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

export const getProfiles = async () => {
  const res = await client.profile.$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<Profile[]>
    return data
  }

  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch profiles')
}
