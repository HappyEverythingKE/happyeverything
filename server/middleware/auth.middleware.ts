import type { Context, MiddlewareHandler } from 'hono'
import { env } from 'hono/adapter'
import { getCookie, setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import type { UserContext } from '@/user-context'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createAdminClient } from '@supabase/supabase-js'

import type { AppEnv } from '@/shared/types'

declare module 'hono' {
  interface ContextVariableMap {
    supabase: SupabaseClient
    supabaseAdmin: SupabaseClient
  }
}

// utility to access the RLS-aware Supabase client
export const getSupabase = (c: Context) => {
  return c.get('supabase')
}

// utility to access the admin Supabase client
export const getAdminSupabase = (c: Context) => {
  return c.get('supabaseAdmin')
}

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const { SUPABASE_URL, SUPABASE_PUBLIC_KEY, SUPABASE_SERVICE_ROLE_KEY } =
      env<AppEnv>(c)

    if (!SUPABASE_URL) {
      throw new Error('SUPABASE_URL missing!')
    }

    if (!SUPABASE_PUBLIC_KEY) {
      throw new Error('SUPABASE_PUBLIC_KEY missing!')
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY missing!')
    }

    // authenticated Supabase client (uses cookies, respects RLS)
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
      cookies: {
        getAll() {
          return Object.entries(getCookie(c)).map(([name, value]) => ({
            name,
            value,
          }))
        },
        setAll: (cookies) => {
          cookies.forEach(({ name, value, ...options }) => {
            setCookie(c, name, value, {
              ...options,
              httpOnly: true,
              secure: true,
              sameSite: 'Lax',
            })
          })
        },
      },
    })

    // admin Supabase client (bypasses RLS, never sent to client)
    const supabaseAdmin = createAdminClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    )

    c.set('supabase', supabase)
    c.set('supabaseAdmin', supabaseAdmin)

    await next()
  }
}

export const getUserSession = createMiddleware<UserContext>(async (c, next) => {
  const supabase = getSupabase(c)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  c.set('user', user)
  await next()
})
