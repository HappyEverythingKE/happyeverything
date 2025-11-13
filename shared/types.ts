import { z } from 'zod'

export type AppEnv = {
  APP_BASE_URL: string
  CF_ACCOUNT_ID: string
  CF_IMAGES_API_TOKEN: string
  SUPABASE_URL: string
  SUPABASE_PUBLIC_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  SUPABASE_PROJECT_ID: string
  MAX_PROFILES_PER_USER: number
  MAX_LISTS_PER_PROFILE: number
  MAX_ITEMS_PER_LIST: number
  MAX_TOP_PICKS_PER_LIST: number
}

export type DirectUploadData = {
  uploadURL: string
  imageId: string
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

export const StatusType = z.enum(['active', 'archived', 'dormant'])
export type StatusType = z.infer<typeof StatusType>

export const ListStatusType = z.enum(['draft', 'published', 'archived'])
export type ListStatusType = z.infer<typeof ListStatusType>

export const ListItemStatusType = z.enum(['active', 'gifted'])
export type ListItemStatusType = z.infer<typeof ListItemStatusType>

export const MAX_FILE_SIZE_MB = 2
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export type AuthContext = {
  isAuthenticated: boolean
}

export type CurrentUser = {
  email: string
  name: string
  status: StatusType
  avatar?: string
  country?: string
}

export type Account = CurrentUser & {
  createdAt: string
  profiles: {
    slug: string
    status: StatusType
    lists: { name: string; slug: string }[]
  }[]
}

export type Profile = {
  slug: string
  status: StatusType
  lists?: List[]
}

export type PublicListOwner = {
  name: string
  avatar: string
  profileSlug: string
  accountCountry: string
}

export type ListType = {
  id: string
  name: string
  imageId?: string
  isCustom: boolean
}

export type TopPickType = z.infer<typeof TopPickSchema>

export type List = {
  id: string
  name: string
  slug: string
  listType: ListType
  description?: string
  isPrivate: boolean
  password?: string
  status: ListStatusType
  createdAt: string
  updatedAt?: string
}

export type ListItem = {
  id: string
  name: string
  quantity: number
  topPick: boolean
  size?: string
  colour?: string
  imageId?: string
  shop?: string
  notes?: string
  reservedCount: number
  stillNeeds: number
  gifters?: {
    gifter_name: string | null
    quantity_reserved: number
  }[]
  createdAt: string
  updatedAt?: string
}

export type ListWithItems = List & {
  items: ListItem[]
}

export type PublicListResponse =
  | { listOwner: PublicListOwner; list: Omit<ListWithItems, 'password'> }
  | {
      listOwner: Pick<PublicListOwner, 'name' | 'profileSlug'>
      privateList: Pick<List, 'name' | 'slug' | 'isPrivate'>
    }

export type GiftReservation = {
  gifterName?: string
  quantityReserved: number
}

export type ReserveGiftResponse = {
  item: {
    itemId: string
    quantityReserved: number
    stillNeeds: number
  }
}

export type ProfileGiftActivity = {
  gifterName: string
  listName: string
  createdAt: string
}

export const SignupSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(32, 'Password cannot exceed 32 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/\d/, 'Password must contain at least one digit.'),
})

export const EmailSchema = SignupSchema.pick({ email: true })
export const PasswordSchema = SignupSchema.pick({ password: true })

export const AccountSchema = z.object({
  name: z.string().trim().min(3, 'Please enter your full name.').max(31),
  // email: z.string().email('Please enter a valid email.'),
  country: z.string().trim().min(1, 'Please enter a country.'),
  avatar: z.string().optional(),
})

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
    .max(100, 'The description must be less than 100 characters')
    .optional(),
  listTypeId: z.string(),
})

export const ListShareSchema = z.object({
  isPrivate: z.preprocess((val) => {
    if (typeof val === 'boolean') return val
    return String(val).toLowerCase() === 'true'
  }, z.boolean()),
  password: z.string().optional(),
})

export const ListItemCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'This field is required.')
    .max(150, 'Item name must be less than 150 characters.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  size: z.string().max(50, 'Size must be less than 50 characters.').optional(),
  colour: z
    .string()
    .max(50, 'Colour must be less than 50 characters.')
    .optional(),
  imageId: z.string().optional(),
  shop: z
    .string()
    .transform((value) => value.trim())
    .refine(
      (value) => {
        if (value === '') return true // Allow empty values

        // Check if it's a URL
        try {
          new URL(value)
          return true
        } catch {
          // Not a URL, check if it's a valid shop name (under 50 chars)
          return value.length <= 50
        }
      },
      {
        message:
          'Please enter either a valid URL or a shop name (max 50 characters)',
      },
    )
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  notes: z
    .string()
    .max(250, 'Notes must be less than 250 characters.')
    .optional(),
})

export const TopPickSchema = z.object({
  topPick: z.string().transform((value) => {
    if (value === 'true') {
      return true
    } else if (value === 'false') {
      return false
    } else {
      throw new Error("Invalid boolean string. Must be 'true' or 'false'.")
    }
  }),
})

export const GiftReservationCreateSchema = z.object({
  gifterName: z
    .string()
    .max(50, 'This field must be less than 50 characters.')
    .optional(),
  quantityReserved: z.coerce
    .number()
    .int()
    .positive()
    .min(1, 'Please enter a quantity.'),
})
