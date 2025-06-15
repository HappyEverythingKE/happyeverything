import { z } from 'zod'

import type { ApiRoutes } from '../server/app'

export { type ApiRoutes }

export type AppEnv = {
  APP_BASE_URL: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  MAX_ACCOUNTS_PER_USER: number
}

export type SuccessResponse<T = void> = {
  success: true
  message: string
} & (T extends void ? {} : { data: T })

export type ErrorResponse = {
  success: false
  error: string
  isFormError?: boolean
}

export type CurrentUser = {
  email: string
  name: string
  onboarding_completed: string
}

export const SignupSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  name: z.string().trim().min(3, 'Please enter your full name.').max(31),
})

export const LoginSchema = SignupSchema.pick({ email: true })

export const ProfileSlugSchema = z.object({
  slug: z.string(),
})
