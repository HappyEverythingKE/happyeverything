import { z } from 'zod'

export type AppEnv = {
  APP_BASE_URL: string
  SUPABASE_URL: string
  SUPABASE_PUBLIC_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_PROJECT_ID: string
  MAX_PROFILES_PER_USER: number
  MAX_LISTS_PER_PROFILE: number
  MAX_ITEMS_PER_LIST: number
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

export type List = {
  id: string
  profileId: string
  name: string
  slug: string
  description?: string
  private: boolean
  password?: string
  status: string
  createdAt: string
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

export const ListCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'This field is required.')
    .max(25, 'List name must be less than 25 characters.'),
  description: z
    .string()
    .max(50, 'The description must be less than 100 characters')
    .optional(),
  listType: z.string().optional(),
})

export const ListUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  password: z.string().optional(),
  status: z.string().optional(),
})
