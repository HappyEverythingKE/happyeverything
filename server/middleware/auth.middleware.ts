import type { Context, MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr'
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

    // Serialized Set-Cookie headers to append after the response is ready
    const cookieHeaders: string[] = []

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
      cookies: {
        getAll() {
          // parseCookieHeader may return undefined values — filter them out
          // to satisfy the { name: string; value: string }[] type requirement
          return parseCookieHeader(c.req.header('Cookie') ?? '').filter(
            (cookie): cookie is { name: string; value: string } =>
              cookie.value !== undefined,
          )
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            cookieHeaders.push(
              serializeCookieHeader(name, value, {
  ...options,
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: COOKIE_MAX_AGE,
  domain: '.myhappyeverything.com', // 👈 add this line
})
            )
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

    // Append all Set-Cookie headers to the response.
    // Using append (not set) so multiple cookies don't overwrite each other.
    cookieHeaders.forEach((cookie) => {
      c.header('Set-Cookie', cookie, { append: true })
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
