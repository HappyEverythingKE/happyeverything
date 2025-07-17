import { queryOptions, useQueryClient } from '@tanstack/react-query'

import type {
  AuthContext,
  CurrentUser,
  ErrorResponse,
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'
import { supabase } from '@/lib/supabase'

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

// TODO: add this to _authed or dashboard route.tsx to log user out on session change
// reference useEffect in ARV-frontend
export const getSessionChange = () => {
  const queryClient = useQueryClient()

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      queryClient.invalidateQueries() // confirm that page reloads on logout
      // queryClient.removeQueries({ queryKey: ['session', 'user-profile'] })

      window.location.href = '/'
    }
  })

  return data
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

export const profileQueryOptions = queryOptions({
  queryKey: ['user-profile'],
  queryFn: getCurrentUserProfile,
  staleTime: Infinity,
})
