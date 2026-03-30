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
// Hardcoded as a typed const (not spread into a Record<string,unknown>)
// so that Hono's setCookie actually applies maxAge at runtime.
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'Lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
} as const

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

    // Cookies that Supabase wants to set — collected during the request
    // and written after next() so the response is already prepared.
    const cookiesToSet: Array<{ name: string; value: string }> = []

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
          // Only collect name+value here — options are applied below using
          // AUTH_COOKIE_OPTIONS so that maxAge is never lost inside a
          // Record<string,unknown> cast.
          cookies.forEach(({ name, value }) => {
            cookiesToSet.push({ name, value })
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

    // Set all cookies after the response has been processed,
    // using the hardcoded typed options so maxAge is guaranteed to apply.
    cookiesToSet.forEach(({ name, value }) => {
      setCookie(c, name, value, AUTH_COOKIE_OPTIONS)
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
