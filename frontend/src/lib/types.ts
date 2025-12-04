import { z } from 'zod'

export const ContactFormSchema = z.object({
  fullName: z.string().trim().min(3, 'Please enter your name.').max(31),
  email: z.string().email('Please enter a valid email.'),
  message: z.string().trim().min(5, 'Please enter a message.').max(250),
  termsChecked: z.coerce.boolean().refine((bool) => bool == true, {
    message: 'Please accept the terms.',
  }),
})

export type ImageContext =
  | 'marketing-large'
  | 'marketing-medium'
  | 'marketing-thumb'
  | 'avatar-thumb'
  | 'avatar-medium'
  | 'list-item'
  | 'thumbnail'

export type DeleteImageOptions = {
  listItemId?: string
}
