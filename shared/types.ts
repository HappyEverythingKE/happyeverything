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
  MAX_TOP_PICKS_PER_LIST: number
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
  imageUrl: string | null
  isCustom: boolean
}

export type TopPickType = z.infer<typeof TopPickSchema>

export type List = {
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
  publicId: string
  name: string
  quantity: number
  topPick: boolean
  size?: string
  colour?: string
  imageUrl?: string
  productUrl?: string
  shopName?: string
  reservedCount: number
  stillNeeds: number
  gifters?: Gifter[]
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

export type Gifter = {
  gifter_name: string | null
  quantity_reserved: number
}

export type GiftReservationType = {
  gifterName?: string
  quantityReserved: number
}

export type ReserveGiftResponse = {
  item: {
    publicId: string
    quantityReserved: number
    stillNeeds: number
  }
}

export const SignupSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  name: z.string().trim().min(3, 'Please enter your full name.').max(31),
  country: z.string().trim().min(1, 'Please enter a country.'),
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
  imageUrl: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value === '' || /^https?:\/\/.+/.test(value), {
      message: 'Please enter a valid URL starting with http:// or https://',
    })
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  productUrl: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value === '' || /^https?:\/\/.+/.test(value), {
      message: 'Please enter a valid URL starting with http:// or https://',
    })
    .transform((value) => (value === '' ? undefined : value))
    .optional(),
  shopName: z
    .string()
    .max(50, 'Shop name must be less than 50 characters.')
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
