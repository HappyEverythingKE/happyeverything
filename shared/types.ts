// import { z } from 'zod'

// export const ContactFormSchema = z.object({
//   fullName: z.string().trim().min(3, 'Please enter your name.').max(31),
//   email: z.string().email('Please enter a valid email.'),
//   message: z.string().trim().min(5, 'Please enter a message.').max(250),
//   termsChecked: z.coerce.boolean().refine((bool) => bool == true, {
//     message: 'Please accept the terms.',
//   }),
// })
