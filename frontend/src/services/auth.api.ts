import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  AuthContext,
  CurrentUser,
  ErrorResponse,
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'

export const postSignup = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  const res = await client.auth.signup.$post({
    form: {
      email,
      password,
    },
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  return data
}

export const postLogin = async ({
  email,
  password,
}: {
  email: string
  password: string
}) => {
  const res = await client.auth.login.$post({
    form: {
      email,
      password,
    },
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse
    return data
  }
  const data = (await res.json()) as unknown as ErrorResponse
  return data
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

export const updatePassword = async (password: string) => {
  const res = await client.auth.password.$patch({
    json: { password },
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse
    return data
  }
  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to update password')
}

export const updateEmail = async (email: string) => {
  const res = await client.auth.email.$patch({
    json: { email },
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to update email')
}

// TODO: add supabase trigger to update account email when auth email is updated
export const useUpdateEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => updateEmail(email),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['current-user'] })
      // TODO: see if this is needed after the supabase trigger is added
      await queryClient.invalidateQueries({ queryKey: ['account'] })
    },
  })
}

export const postResendConfirmationEmail = async (email: string) => {
  const res = await client.auth['resend-confirmation-email'].$post({
    form: {
      email,
    },
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse
    return data
  }
  throw new Error('Failed to send confirmation email')
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
