import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { getSupabase } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'
import slugify from '@sindresorhus/slugify'

import {
  ListCreateSchema,
  ProfileSlugSchema,
  type AppEnv,
  type List,
  type SuccessResponse,
} from '@/shared/types'

export const listsRoutes = new Hono()
  .get('/:profileId', async (c) => {
    const profileId = c.req.param('profileId')
    const supabase = getSupabase(c)

    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('*')
      .eq('profile_id', profileId)

    console.log('API Fetched lists:', lists, listsError)

    if (listsError) {
      throw new HTTPException(500, {
        message: listsError.message,
      })
    }

    return c.json<SuccessResponse<{ lists: List[] }>>({
      success: true,
      data: { lists },
    })
  })
  .post('/:profileId', zValidator('form', ListCreateSchema), async (c) => {
    const profileId = c.req.param('profileId')
    const supabase = getSupabase(c)
    // const body = await c.req.json()
    const { name, description } = c.req.valid('form') // TODO: add list type
    console.log('API: Creating list for profile:', profileId, {
      name,
      description,
    })
    // const { error } = ListCreateSchema.safeParse(body)

    // if (error) {
    //   throw new HTTPException(400, {
    //     message: error.message,
    //     cause: { form: true },
    //   })
    // }

    // count existing lists belonging to this profile
    const { count, error: countError } = await supabase
      .from('lists')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profileId)

    if (countError) {
      throw new HTTPException(500, {
        message: 'List limit check failed.',
      })
    }

    const { MAX_LISTS_PER_PROFILE } = env<AppEnv>(c)

    if ((count ?? 0) >= MAX_LISTS_PER_PROFILE) {
      throw new HTTPException(403, {
        message: `You’ve reached the limit of ${MAX_LISTS_PER_PROFILE} lists for this profile.`,
      })
    }

    // generate the slug from the name
    const generatedSlug = slugify(name)
    console.log('API Generated slug:', generatedSlug)

    // ensure the slug is unique to this user's lists.
    const { data: existingList, error: existingError } = await supabase
      .from('lists')
      .select('id')
      .eq('profile_id', profileId)
      .eq('slug', generatedSlug)
      .maybeSingle()

    if (existingError) {
      throw new HTTPException(500, {
        message: existingError.message,
      })
    }

    if (existingList) {
      throw new HTTPException(409, {
        message: 'You already have a list with that name. Try another!',
        cause: { form: true },
      })
    }

    // insert the new list
    // TODO: add list type
    const { data, error: insertError } = await supabase
      .from('lists')
      .insert({
        profile_id: profileId,
        name,
        slug: generatedSlug,
        description: description,
      })
      .select('*')
      .single()

    console.log('API Inserted list:', data, insertError)

    if (insertError) {
      throw new HTTPException(500, {
        message: insertError.message,
        // 'Failed to create your list'
      })
    }

    return c.json<SuccessResponse<List>>(
      {
        success: true,
        data,
      },
      201,
    )
  })
  .patch('/:listId', async (c) => {
    const listId = c.req.param('listId')
    const supabase = getSupabase(c)
    const body = await c.req.json()

    const { error } = ProfileSlugSchema.partial().safeParse(body)
    if (error) {
      throw new HTTPException(400, {
        message: error.message,
        cause: { form: true },
      })
    }

    // TODO: ensure the slug is unique to this user's lists. Pass in the profileId to the query

    const { data, error: updateError } = await supabase
      .from('lists')
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description,
        private: body.private,
        password: body.password,
      })
      .eq('id', listId)
      .select('*')
      .single()

    if (updateError) {
      if (updateError.code === '23505') {
        // Supabase/Postgres unique constraint violation
        throw new HTTPException(409, {
          message: 'You already have a list with this name. Try another!',
          cause: { form: true },
        })
      }

      throw new HTTPException(500, {
        message: updateError.message,
      })
    }

    return c.json<SuccessResponse<List>>({
      success: true,
      data,
    })
  })

// .delete('/:id', async (c) => {
//   const supabase = getSupabase(c)
//   const id = c.req.param('id')

//   const { error } = await supabase.from('lists').delete().where('id', id)

//   if (error) throw error

//   return c.json<SuccessResponse>({
//     success: true,
//     message: 'List deleted successfully',
//   })
// })
