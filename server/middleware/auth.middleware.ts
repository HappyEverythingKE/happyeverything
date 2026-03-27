import type { Context, MiddlewareHandler } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createAdminClient } from '@supabase/supabase-js'

import type { UserContext } from '../user-context'

declare module 'hono' {
  interface ContextVariableMap {
    supabase: SupabaseClient
    supabaseAdmin: SupabaseClient
  }
}

// Matches Supabase's default session length of 7 days.
// Without this, cookies are session cookies and are wiped when the
// browser is fully closed — causing users to be logged out on reopen.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

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
    const SUPABASE_URL = process.env['SUPABASE_URL']
    const SUPABASE_PUBLIC_KEY = process.env['SUPABASE_PUBLIC_KEY']
    const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']

    if (!SUPABASE_URL) {
      throw new Error('SUPABASE_URL missing!')
    }

    if (!SUPABASE_PUBLIC_KEY) {
      throw new Error('SUPABASE_PUBLIC_KEY missing!')
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY missing!')
    }

    // Store cookies to be set after the request
    const cookiesToSet: Array<{
      name: string
      value: string
      options?: Record<string, unknown>
    }> = []

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
          // Store cookies to be set later instead of setting them immediately
          cookies.forEach(({ name, value, ...options }) => {
            cookiesToSet.push({
              name,
              value,
              options: {
                ...options,
                httpOnly: true,
                secure: true,
                sameSite: 'Lax',
                maxAge: COOKIE_MAX_AGE,
              },
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

    // Set all cookies after the response has been processed
    cookiesToSet.forEach(({ name, value, options }) => {
      setCookie(c, name, value, options)
    })
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
