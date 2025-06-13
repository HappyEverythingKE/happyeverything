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
    // callback url gets called every time user logs/signs-in with magic link

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

    if (error) {
      throw new HTTPException(error.status as ContentfulStatusCode, {
        message: error.message,
      })
    }

    return c.json<SuccessResponse<{ data: AuthResponse['data']['session'] }>>(
      {
        success: true,
        message: 'User verified',
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
      data: { email: user.email },
    })
  })
