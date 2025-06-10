import type { Context, MiddlewareHandler } from 'hono'
import { env } from 'hono/adapter'
import { getCookie, setCookie } from 'hono/cookie'

import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

declare module 'hono' {
  interface ContextVariableMap {
    supabase: SupabaseClient
  }
}

export const getSupabase = (c: Context) => {
  return c.get('supabase')
}

type SupabaseEnv = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export const supabaseMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const supabaseEnv = env<SupabaseEnv>(c)
    const supabaseUrl = supabaseEnv.SUPABASE_URL
    const supabaseAnonKey = supabaseEnv.SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL missing!')
    }

    if (!supabaseAnonKey) {
      throw new Error('SUPABASE_ANON_KEY missing!')
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          const cookies = Object.entries(getCookie(c)).map(([name, value]) => ({
            name,
            value,
          }))
          return cookies
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
