import { queryOptions } from '@tanstack/react-query'

import type {
  AuthContext,
  CurrentUser,
  ErrorResponse,
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'

export const postSignup = async ({
  email,
  name,
  country,
}: {
  email: string
  name: string
  country: string
}) => {
  try {
    const res = await client.auth.signup.$post({
      form: {
        email,
        name,
        country,
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

export const postLogin = async ({ email }: { email: string }) => {
  try {
    const res = await client.auth.login.$post({
      form: {
        email,
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
  throw new Error(data.error ?? 'Verification failed')
}

export const getSession = async () => {
  const res = await client.auth.session.$get({})
  const data = (await res.json()) as AuthContext
  return data
}

export const sessionQueryOptions = queryOptions({
  queryKey: ['session'],
  queryFn: getSession,
  staleTime: Infinity,
})

export const getCurrentUser = async () => {
  const res = await client.auth.me.$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<CurrentUser>
    return data
  }
  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch user')
}

export const userQueryOptions = queryOptions({
  queryKey: ['current-user'],
  queryFn: getCurrentUser,
})

export const getLogout = async () => {
  const res = await client.auth.logout.$get({})

  if (!res.ok) {
    const data = (await res.json()) as unknown as ErrorResponse
    throw new Error(data.error ?? 'Failed to log out')
  }
}
