import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { getSupabase, getUserSession } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import type { AppEnv, CurrentUser, SuccessResponse } from '@/shared/types'

export const authRoutes = new Hono()
  .post(
    '/login',
    zValidator(
      'form',
      z.object({ email: z.string(), name: z.string().optional() }),
    ),
    async (c) => {
      const supabase = getSupabase(c)
      const { email, name } = c.req.valid('form')

      const { APP_BASE_URL } = env<AppEnv>(c)
      const redirectURL = `${APP_BASE_URL}/auth/confirm`

      const userOptions = name
        ? {
            data: { name },
            emailRedirectTo: redirectURL,
          }
        : { emailRedirectTo: redirectURL }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: userOptions,
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
    },
  )
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

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email',
    })

    if (error) {
      throw new HTTPException(error.status as ContentfulStatusCode, {
        message: error.message,
      })
    }

    return c.json<SuccessResponse>(
      {
        success: true,
        message: 'User verified',
      },
      200,
    )
  })
  .get('/logout', async (c) => {
    const supabase = getSupabase(c)

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new HTTPException(error.status as ContentfulStatusCode, {
        message: 'An error occured while logging out',
      })
    }

    return c.redirect('/')
  })
  .get('/me', getUserSession, async (c) => {
    const user = c.get('user')!

    const supabase = getSupabase(c)
    const { data, error } = await supabase
      .from('accounts')
      .select('email, name, onboarding_completed')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      throw new HTTPException(500, { message: 'Failed to fetch user profile' })
    }

    return c.json<SuccessResponse<CurrentUser>>({
      success: true,
      message: 'Fetched user profile',
      data,
    })
  })
