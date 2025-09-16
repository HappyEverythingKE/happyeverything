import { queryOptions } from '@tanstack/react-query'

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
