import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { endTime, startTime } from 'hono/timing'

import { getSupabase } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { SignupSchema, type SuccessResponse } from '@/shared/types'

export const authRoutes = new Hono()
  .post('/sign-up', zValidator('form', SignupSchema), async (c) => {
    const supabase = getSupabase(c)
    const { email, password } = c.req.valid('form')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error || !data?.user) {
        console.log(error)
        throw new Error(error?.message || 'Error while signing up', {
          cause: error,
        })
      }

      return c.json<SuccessResponse>(
        {
          success: true,
          message: 'User created',
        },
        201,
      )
    } catch (error) {
      //  if (error instanceof postgres.PostgresError && error.code === "23505") {
      //   throw new HTTPException(409, {
      //     message: "Username already used",
      //     cause: { form: true },
      //   });
      // }
      throw new HTTPException(500, {
        message: 'Failed to create user',
        cause: error,
      })
    }
  })
  .post(
    '/sign-in',
    zValidator(
      'json',
      z.object({
        email: z.string(),
        password: z.string().min(8),
      }),
    ),
    async (c) => {
      const supabase = getSupabase(c)
      const { email, password } = c.req.valid('json')

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Error while signing in', error)
        throw new HTTPException(401, { message: error.message })
      }

      setCookie(c, 'access_token', data?.session.access_token, {
        ...(data?.session.expires_at && {
          expires: new Date(data.session.expires_at),
        }),
        httpOnly: true,
        path: '/',
        secure: true,
      })

      setCookie(c, 'refresh_token', data?.session.refresh_token, {
        ...(data?.session.expires_at && {
          expires: new Date(data.session.expires_at),
        }),
        httpOnly: true,
        path: '/',
        secure: true,
      })

      return c.json(data.user)
    },
  )
  .post(
    '/sign-in-with-provider',
    zValidator(
      'json',
      z.object({
        provider: z.enum(['google']),
        token: z.string().min(8),
        accessToken: z.string().optional(),
      }),
    ),
    async (c) => {
      const supabase = getSupabase(c)
      const { token, provider, accessToken } = c.req.valid('json')
      // start a new timer
      startTime(c, 'supabase.auth.signInWithProvider')
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider,
        token,
        access_token: accessToken,
      })
      // end the timer
      endTime(c, 'supabase.auth.signInWithProvider')

      if (error) {
        console.error('Error while signing in with Provider ', error)
        throw new HTTPException(401, { message: error.message })
      }

      setCookie(c, 'access_token', data?.session.access_token, {
        ...(data?.session.expires_at && {
          expires: new Date(data.session.expires_at),
        }),
        httpOnly: true,
        path: '/',
        secure: true,
      })

      setCookie(c, 'refresh_token', data?.session.refresh_token, {
        ...(data?.session.expires_at && {
          expires: new Date(data.session.expires_at),
        }),
        httpOnly: true,
        path: '/',
        secure: true,
      })

      return c.json(data.user)
    },
  )
  .get('/refresh', async (c) => {
    const supabase = getSupabase(c)
    const refresh_token = getCookie(c, 'refresh_token')
    if (!refresh_token) {
      throw new HTTPException(403, { message: 'No refresh token' })
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    })

    if (error) {
      console.error('Error while refreshing token', error)
      throw new HTTPException(403, { message: error.message })
    }

    if (data?.session) {
      setCookie(c, 'refresh_token', data.session.refresh_token, {
        ...(data.session.expires_at && {
          expires: new Date(data.session.expires_at),
        }),
        // httpOnly: true,
        // path: "/",
        // secure: true,
      })
    }

    return c.json(data.user)
  })

// import { Hono } from 'hono'

// import { getSupabase } from '@/middleware/auth.middleware'

// export const authRoute = new Hono()

// authRoute.post('/signup', async (c) => {
//   const supabase = getSupabase(c)
//   const { email, password } = await c.req.json()
//   console.log(email, password)

//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.signUp({ email, password })
//   if (error) return c.json({ error: error.message }, 400)

//   return c.json({ success: true, data: user })
// })

// authRoute.post('/login', async (c) => {
//   const supabase = getSupabase(c)
//   const { email, password } = await c.req.json()
//   console.log(email, password)

//   const {
//     data: { user },
//     error,
//   } = await supabase.auth.signInWithPassword({ email, password })
//   if (error) return c.json({ error: error.message }, 401)

//   return c.json({ success: true, data: user })
// })
