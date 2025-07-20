import { z } from 'zod'

import type { ApiRoutes } from '../server/app'

export { type ApiRoutes }

export type AppEnv = {
  APP_BASE_URL: string
  SUPABASE_URL: string
  SUPABASE_PUBLIC_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_PROJECT_ID: string
  MAX_ACCOUNTS_PER_USER: number
}

export type SuccessResponse<T = void> = {
  success: true
  message?: string
} & (T extends void ? {} : { data: T })

export type ErrorResponse = {
  success: false
  error: string
  isFormError?: boolean
}

export type AuthContext = {
  isAuthenticated: boolean
}

export type CurrentUser = {
  email: string
  name: string
  avatar: string | undefined
  profiles: {
    id: string
    slug: string
    status: string
  }[]
}

export const SignupSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  name: z.string().trim().min(3, 'Please enter your full name.').max(31),
})

export const LoginSchema = SignupSchema.pick({ email: true })

export const ProfileSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long.')
    .max(20, 'Username must be at most 20 characters long.')
    .regex(
      /^[a-z0-9-]+$/,
      'Username can only contain lowercase letters, numbers, and hyphens.',
    )
    .refine(
      (value) => !value.startsWith('-') && !value.endsWith('-'),
      'Username cannot start or end with a hyphen.',
    )
    .transform((value) => value.toLowerCase()),
})
