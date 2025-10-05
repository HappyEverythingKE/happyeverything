import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import { zValidator } from '@hono/zod-validator'
import { type EmailOtpType } from '@supabase/supabase-js'

import {
  SignupSchema,
  type AppEnv,
  type AuthContext,
  type CurrentUser,
  type SuccessResponse,
} from '../../shared/types'
import {
  getAdminSupabase,
  getSupabase,
  getUserSession,
} from '../middleware/auth.middleware'

export const authRoutes = new Hono()
  .post('/signup', zValidator('form', SignupSchema), async (c) => {
    const supabase = getSupabase(c)
    const supabaseAdmin = getAdminSupabase(c)
    const { email, password } = c.req.valid('form')

    // check if user already exists using supabaseAdmin to bypass RLS
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from('accounts')
      .select('email')
      .ilike('email', email)
      .maybeSingle()

    if (searchError) {
      throw new HTTPException(500, {
        message: 'Error checking user.',
      })
    }

    if (existingUser) {
      throw new HTTPException(400, {
        message: 'Looks like you already have an account. Log in instead.',
        cause: { form: true },
      })
    }

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signupError) {
      throw new HTTPException(signupError.status as ContentfulStatusCode, {
        message: signupError.message,
        cause: { form: true },
      })
    }

    return c.json<SuccessResponse>(
      {
        success: true,
      },
      200,
    )
  })
  .post('/login', zValidator('form', SignupSchema), async (c) => {
    const supabase = getSupabase(c)
    const supabaseAdmin = getAdminSupabase(c)
    const { email, password } = c.req.valid('form')

    // check if user already exists using supabaseAdmin to bypass RLS
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from('accounts')
      .select('email')
      .ilike('email', email)
      .maybeSingle()

    if (searchError) {
      throw new HTTPException(500, {
        message: 'Error checking user.',
      })
    }

    if (!existingUser) {
      throw new HTTPException(400, {
        message: 'Create your account through our Sign Up page.',
        cause: { form: true },
      })
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      throw new HTTPException(loginError.status as ContentfulStatusCode, {
        message: loginError.message,
        cause: { form: true },
      })
    }

    return c.json<SuccessResponse>(
      {
        success: true,
      },
      200,
    )
  })
  .post(
    '/resend-confirmation-email',
    zValidator('form', SignupSchema.pick({ email: true })),
    async (c) => {
      const supabase = getSupabase(c)
      const { email } = c.req.valid('form')

      const { error } = await supabase.auth.resend({
        email,
        type: 'signup',
      })

      if (error) {
        throw new HTTPException(error.status as ContentfulStatusCode, {
          message: error.message,
        })
      }

      return c.json<SuccessResponse>(
        {
          success: true,
        },
        200,
      )
    },
  )
  .get('/confirm', async (c) => {
    // callback url for token exchange
    const token_hash = c.req.query('token_hash')!
    const type = c.req.query('type') as EmailOtpType | null

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
      },
      200,
    )
  })
  .get('/session', getUserSession, async (c) => {
    return c.json<AuthContext>({
      isAuthenticated: true,
    })
  })
  .get('/me', getUserSession, async (c) => {
    const user = c.get('user')!
    const providerAvatar = user.user_metadata?.['avatar_url'] || undefined

    const supabase = getSupabase(c)

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('email, name, status, avatar, country')
      .eq('id', user.id)
      .single()

    if (accountError || !account) {
      throw new HTTPException(500, {
        message: accountError?.message,
      })
    }

    const userData: CurrentUser = {
      email: account.email,
      name: account.name,
      status: account.status,
      avatar: account.avatar || providerAvatar || undefined,
      country: account.country,
    }

    return c.json<SuccessResponse<CurrentUser>>(
      {
        success: true,
        data: userData,
      },
      200,
    )
  })
  .get('/logout', async (c) => {
    const supabase = getSupabase(c)

    const { SUPABASE_PROJECT_ID } = env<AppEnv>(c)

    c.header(
      'Set-Cookie',
      `sb-${SUPABASE_PROJECT_ID}-auth-token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    )
    c.header(
      'Set-Cookie',
      `sb-${SUPABASE_PROJECT_ID}-auth-token-code-verifier=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    )

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new HTTPException(error.status as ContentfulStatusCode, {
        message: error.message,
      })
    }

    return c.json<SuccessResponse>(
      {
        success: true,
      },
      200,
    )
  })
