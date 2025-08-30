import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { getSupabase, getUserSession } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'

import {
  ProfileSlugSchema,
  type AppEnv,
  type Profile,
  type SuccessResponse,
} from '@/shared/types'

export const profileRoutes = new Hono()
  .post(
    '/',
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
          message: 'Profile limit check failed.',
        })
      }
      const { MAX_PROFILES_PER_USER } = env<AppEnv>(c)

      if ((count ?? 0) >= MAX_PROFILES_PER_USER) {
        throw new HTTPException(403, {
          message: `You’ve reached the limit of ${MAX_PROFILES_PER_USER} profiles.`,
        })
      }

      // insert new profile with slug
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          account_id: user.id,
          slug,
        })
        .select('slug, status')
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

      return c.json<SuccessResponse<Profile>>(
        {
          success: true,
          data,
        },
        201,
      )
    },
  )
  .get('/', getUserSession, async (c) => {
    const user = c.get('user')!
    const supabase = getSupabase(c)

    const { data, error } = await supabase
      .from('profiles')
      .select('slug, status')
      .eq('account_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new HTTPException(500, {
        message: 'Failed to fetch profiles',
      })
    }

    return c.json<SuccessResponse<Profile[]>>({
      success: true,
      data,
    })
  })
