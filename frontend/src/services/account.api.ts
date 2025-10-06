import { useRouter } from '@tanstack/react-router'
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type { Account, ErrorResponse, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

export const fetchAccount = async () => {
  const res = await client.account.$get({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<Account>
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch account')
}

export const accountQueryOptions = queryOptions({
  queryKey: ['account'],
  queryFn: fetchAccount,
})

export const updateAccount = async (accountData: {
  name: string
  country: string
}) => {
  const res = await client.account.$patch({
    form: accountData,
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<Account>
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to update account')
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountData: { name: string; country: string }) =>
      updateAccount(accountData),
    onSuccess: async (res) => {
      if (!res.success) return

      const updatedCurrentUser = {
        email: res.data.email,
        name: res.data.name,
        status: res.data.status,
        avatar: res.data.avatar,
        country: res.data.country,
      }

      queryClient.setQueryData(['account'], res.data)
      queryClient.setQueryData(['current-user'], updatedCurrentUser)
    },
  })
}

export const updateEmail = async (email: string) => {
  const res = await client.account.email.$patch({
    json: { email },
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to update email')
}

export const useUpdateEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => updateEmail(email),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account'] })
      await queryClient.invalidateQueries({ queryKey: ['current-user'] })
    },
  })
}

export const deleteAccount = async () => {
  const res = await client.account.$delete({})

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to delete the account')
  }
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: async () => {
      queryClient.resetQueries()
      router.invalidate()
    },
  })
}
