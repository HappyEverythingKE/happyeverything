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
  password: z
    .string()
    .trim()
    .max(255)
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      'Password must contain at least 8 characters including one uppercase letter, one lowercase letter, one number, and one special character.',
    ),
})

export type CurrentUser = {
  userEmail?: string
}
