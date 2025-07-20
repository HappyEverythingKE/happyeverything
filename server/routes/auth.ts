import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

import {
  getAdminSupabase,
  getSupabase,
  getUserSession,
} from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import type {
  AppEnv,
  AuthContext,
  CurrentUser,
  SuccessResponse,
} from '@/shared/types'

export const authRoutes = new Hono()
  .post(
    '/signup',
    zValidator('form', z.object({ email: z.string(), name: z.string() })),
    async (c) => {
      const supabase = getSupabase(c)
      const supabaseAdmin = getAdminSupabase(c)
      const { email, name } = c.req.valid('form')

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

      const { APP_BASE_URL } = env<AppEnv>(c)
      const redirectURL = `${APP_BASE_URL}/auth-confirm`

      const { error: signupError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { name },
          emailRedirectTo: redirectURL,
        },
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
    },
  )
  .post(
    '/login',
    zValidator('form', z.object({ email: z.string() })),
    async (c) => {
      const supabase = getSupabase(c)
      const supabaseAdmin = getAdminSupabase(c)
      const { email } = c.req.valid('form')

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
          message: 'Create an account through our Sign Up page.',
          cause: { form: true },
        })
      }

      const { APP_BASE_URL } = env<AppEnv>(c)
      const redirectURL = `${APP_BASE_URL}/auth-confirm`

      const { error: loginError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectURL,
        },
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
      },
      200,
    )
  })
  .get('/session', getUserSession, async (c) => {
    return c.json<AuthContext>({
      isAuthenticated: true,
    })
  })
  .get('/hasProfile', getUserSession, async (c) => {
    const user = c.get('user')!
    const supabase = getSupabase(c)

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('account_id', user.id)
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new HTTPException(500, {
        message: error.message,
      })
    }

    return c.json<SuccessResponse<{ hasProfile: boolean }>>({
      success: true,
      data: {
        hasProfile: !!profile,
      },
    })
  })
  .get('/me', getUserSession, async (c) => {
    const user = c.get('user')!
    const providerAvatar = user.user_metadata?.['avatar_url'] || undefined

    const supabase = getSupabase(c)

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('email, name, avatar')
      .eq('id', user.id)
      .single()

    if (accountError || !account) {
      throw new HTTPException(500, {
        message: accountError?.message,
      })
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, slug, status')
      .eq('account_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)

    if (profileError) {
      throw new HTTPException(500, {
        message: profileError.message,
      })
    }

    const userData: CurrentUser = {
      email: account.email,
      name: account.name,
      avatar: account.avatar || providerAvatar,
      profiles: profiles ?? [],
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
