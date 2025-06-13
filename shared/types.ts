import { z } from 'zod'

import type { ApiRoutes } from '../server/app'

export { type ApiRoutes }

export type SuccessResponse<T = void> = {
  success: true
  message: string
} & (T extends void ? {} : { data: T })

export type ErrorResponse = {
  success: false
  error: string
  isFormError?: boolean
}

export const SignupSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
})

export type CurrentUser = {
  userEmail?: string
}
