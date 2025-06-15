import type { ErrorResponse, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

export const postProfile = async (slug: string) => {
  try {
    const res = await client.account.profile.$post({
      form: {
        slug,
      },
    })

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse<{ data: unknown }>
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
