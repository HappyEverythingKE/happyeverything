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
    console.log('FE data', data)
    return data
  }

  const data = (await res.json()) as ErrorResponse
  throw new Error(data.error ?? 'Failed to fetch account')
}

export const accountQueryOptions = queryOptions({
  queryKey: ['account'],
  queryFn: fetchAccount,
  staleTime: Infinity,
})

export const updateAccount = async (accountData: Partial<Account>) => {
  const res = await client.account.$patch({
    form: accountData,
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<Account>
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  return data
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountData: Partial<Account>) => updateAccount(accountData),
    onSuccess: async (res) => {
      if (!res.success) return // let the form handle the error

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
