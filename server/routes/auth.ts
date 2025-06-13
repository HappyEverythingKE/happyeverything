import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { getSupabase, getUserSession } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'
import type { AuthResponse } from '@supabase/supabase-js'

import {
  SignupSchema,
  type CurrentUser,
  type SuccessResponse,
} from '@/shared/types'

export const authRoutes = new Hono()
  .post('/signup', zValidator('form', SignupSchema), async (c) => {
    const supabase = getSupabase(c)
    const { email } = c.req.valid('form')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:5173/auth/confirm', // TODO: Update to your deployed domain
      },
    })

    if (error) {
      throw new HTTPException(error.status as ContentfulStatusCode, {
        message: error.message,
        cause: { form: true },
      })
    }

    return c.json<SuccessResponse>(
      {
        success: true,
        message: 'Verifying OTP',
      },
      200,
    )
  })
  .get('/confirm', async (c) => {
    // callback url gets called every time user logs-in or signs-up with magic link

    const token_hash = c.req.query('token_hash')!
    const type = c.req.query('type')

    if (!token_hash || !type) {
      throw new HTTPException(400, {
        message: 'Missing token or type',
      })
    }

    const supabase = getSupabase(c)

    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email',
    })

    console.error('verifyOtp error:', error)

    if (error) {
      throw new HTTPException(error.status as ContentfulStatusCode, {
        message: error.message,
      })
    }

    return c.json<SuccessResponse<{ data: AuthResponse['data']['session'] }>>(
      {
        success: true,
        message: 'Magic link verified!',
        data: { data: session },
      },
      200,
    )
  })
  // .post('/login', zValidator('form', SignupSchema), async (c) => {
  //   const supabase = getSupabase(c)
  //   const { email, password } = c.req.valid('form')

  //   const { data: user, error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   })

  //   if (error) {
  //     if (error.code !== '500') {
  //       throw new HTTPException(error.status as ContentfulStatusCode, {
  //         message: error.message,
  //         cause: { form: true },
  //       })
  //     } else {
  //       throw new HTTPException(500, {
  //         message: 'Failed to log in',
  //         cause: error,
  //       })
  //     }
  //   }

  //   return c.json<SuccessResponse<AuthResponse['data']>>(
  //     {
  //       success: true,
  //       message: 'User logged in',
  //       data: user,
  //     },
  //     200,
  //   )
  // })
  .get('/logout', async (c) => {
    const supabase = getSupabase(c)

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error('An error occured while logging out', error)
    }

    return c.redirect('/')
  })
  .get('/me', getUserSession, async (c) => {
    const user = c.get('user')!

    return c.json<SuccessResponse<CurrentUser>>({
      success: true,
      message: 'User fetched',
      data: { userEmail: user.email },
    })
  })
// .post(
//   '/sign-in-with-provider',
//   zValidator(
//     'json',
//     z.object({
//       provider: z.enum(['google']),
//       token: z.string().min(8),
//       accessToken: z.string().optional(),
//     }),
//   ),
//   async (c) => {
//     const supabase = getSupabase(c)
//     const { token, provider, accessToken } = c.req.valid('json')
//     // start a new timer
//     startTime(c, 'supabase.auth.signInWithProvider')
//     const { data, error } = await supabase.auth.signInWithIdToken({
//       provider,
//       token,
//       access_token: accessToken,
//     })
//     // end the timer
//     endTime(c, 'supabase.auth.signInWithProvider')

//     if (error) {
//       console.error('Error while signing in with Provider ', error)
//       throw new HTTPException(401, { message: error.message })
//     }

//     setCookie(c, 'access_token', data?.session.access_token, {
//       ...(data?.session.expires_at && {
//         expires: new Date(data.session.expires_at),
//       }),
//       httpOnly: true,
//       path: '/',
//       secure: true,
//     })

//     setCookie(c, 'refresh_token', data?.session.refresh_token, {
//       ...(data?.session.expires_at && {
//         expires: new Date(data.session.expires_at),
//       }),
//       httpOnly: true,
//       path: '/',
//       secure: true,
//     })

//     return c.json(data.user)
//   },
// )
// .get('/refresh', async (c) => {
//   const supabase = getSupabase(c)
//   const refresh_token = getCookie(c, 'refresh_token')
//   if (!refresh_token) {
//     throw new HTTPException(403, { message: 'No refresh token' })
//   }

//   const { data, error } = await supabase.auth.refreshSession({
//     refresh_token,
//   })

//   if (error) {
//     console.error('Error while refreshing token', error)
//     throw new HTTPException(403, { message: error.message })
//   }

//   if (data?.session) {
//     setCookie(c, 'refresh_token', data.session.refresh_token, {
//       ...(data.session.expires_at && {
//         expires: new Date(data.session.expires_at),
//       }),
//       // httpOnly: true,
//       // path: "/",
//       // secure: true,
//     })
//   }

//   return c.json(data.user)
// })
