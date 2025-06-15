import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { getSupabase, getUserSession } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'

import {
  ProfileSlugSchema,
  type AppEnv,
  type SuccessResponse,
} from '@/shared/types'

export const accountRoutes = new Hono().post(
  '/profile',
  getUserSession,
  zValidator('form', ProfileSlugSchema),
  async (c) => {
    const user = c.get('user')!
    const { slug } = c.req.valid('form')
    const supabase = getSupabase(c)

    // count existing accounts
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('account_id', user.id)

    if (countError) {
      throw new HTTPException(500, {
        message: 'Profile check failed.',
      })
    }
    const { MAX_ACCOUNTS_PER_USER } = env<AppEnv>(c)

    if ((count ?? 0) >= MAX_ACCOUNTS_PER_USER) {
      throw new HTTPException(403, {
        message: `You’ve reached the limit of ${MAX_ACCOUNTS_PER_USER} profiles.`,
      })
    }

    // insert new profile with slug
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        account_id: user.id,
        slug,
      })
      .select('slug')
      .single()

    if (error) {
      if (error.code === '23505') {
        // Supabase/Postgres unique constraint violation
        throw new HTTPException(409, {
          message: 'That username is already taken. Try another!',
          cause: { form: true },
        })
      }

      throw new HTTPException(500, {
        message: 'Failed to create your profile',
      })
    }

    return c.json<SuccessResponse<{ slug: string }>>(
      {
        success: true,
        message: 'Profile created',
        data: { slug: data.slug },
      },
      201,
    )
  },
)
