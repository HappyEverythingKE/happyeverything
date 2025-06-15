import type { Context, MiddlewareHandler } from 'hono'
import { env } from 'hono/adapter'
import { getCookie, setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'

import type { UserContext } from '@/user-context'
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { AppEnv } from '@/shared/types'

declare module 'hono' {
  interface ContextVariableMap {
    supabase: SupabaseClient
  }
}

export const getSupabase = (c: Context) => {
  return c.get('supabase')
}

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = env<AppEnv>(c)
    const supabaseUrl = SUPABASE_URL
    const supabaseAnonKey = SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL missing!')
    }

    if (!supabaseAnonKey) {
      throw new Error('SUPABASE_ANON_KEY missing!')
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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

    c.set('supabase', supabase)

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
