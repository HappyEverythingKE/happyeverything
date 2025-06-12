import type { ErrorResponse, SuccessResponse } from '@shared/types'

import { client } from '@/lib/api'

export const postSignup = async (email: string, password: string) => {
  try {
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
  } catch (error) {
    return {
      success: false,
      error: String(error),
      isFormError: false,
    } as ErrorResponse
  }
}
