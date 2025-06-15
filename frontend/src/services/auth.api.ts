// import { queryOptions } from '@tanstack/react-query'

import type { CurrentUser, ErrorResponse, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

export const postLogin = async ({
  email,
  name,
}: {
  email: string
  name: string | undefined
}) => {
  try {
    const res = await client.auth.login.$post({
      form: {
        email,
        name,
      },
    })

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse
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

export const getVerifyOTP = async (token_hash: string, type: string) => {
  try {
    const res = await client.auth.confirm.$get({
      query: {
        token_hash: encodeURIComponent(token_hash),
        type: encodeURIComponent(type),
      },
    })

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse
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

export const getCurrentUserProfile = async () => {
  try {
    const res = await client.auth.me.$get({})

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse<CurrentUser>
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

// export const profileQueryOptions = queryOptions({
//   queryKey: ['current-user-profile'],
//   queryFn: getCurrentUserProfile,
//   staleTime: Infinity,
// })
