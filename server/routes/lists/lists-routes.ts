import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { getSupabase } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'
import slugify from '@sindresorhus/slugify'

import {
  ListCreateSchema,
  ListUpdateSchema,
  StatusType,
  type AppEnv,
  type List,
  type SuccessResponse,
} from '@/shared/types'
import {
  resolveListIdFromSlug,
  resolveProfileIdFromSlug,
} from '@/lib/slug-id-lookup'

export const listsRoutes = new Hono()
  .get('/:profileSlug', async (c) => {
    const { profileSlug } = c.req.param()
    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const supabase = getSupabase(c)

    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (listsError) {
      throw new HTTPException(500, {
        message: listsError.message,
      })
    }

    return c.json<SuccessResponse<List[]>>({
      success: true,
      data: lists,
    })
  })
  .post('/:profileSlug', zValidator('form', ListCreateSchema), async (c) => {
    const { profileSlug } = c.req.param()
    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const supabase = getSupabase(c)
    const { name, description } = c.req.valid('form') // TODO: add list type

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

    if (insertError) {
      throw new HTTPException(500, {
        message: 'Failed to create your list',
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
  .get('/:profileSlug/:listSlug', async (c) => {
    const { profileSlug, listSlug } = c.req.param()

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const listId = await resolveListIdFromSlug(c, profileId, listSlug)

    const supabase = getSupabase(c)

    const { data: list, error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', listId)
      .eq('profile_id', profileId)
      .single()

    if (error || !list) {
      throw new HTTPException(404, {
        message: 'List not found',
      })
    }

    return c.json<SuccessResponse<List>>({
      success: true,
      data: { ...list, isPrivate: list.private }, // Convert 'private' to 'isPrivate'
    })
  })
  .patch(
    '/:profileSlug/:listSlug',
    zValidator('form', ListUpdateSchema),
    async (c) => {
      const { profileSlug, listSlug } = c.req.param()

      const profileId = await resolveProfileIdFromSlug(c, profileSlug)
      const listId = await resolveListIdFromSlug(c, profileId, listSlug)

      const supabase = getSupabase(c)

      const { name, description, isPrivate, password } = c.req.valid('form') // TODO: add list type

      let generatedSlug = listSlug
      // if name is being updated, generate the slug from the new name
      if (name) {
        generatedSlug = slugify(name)
        // ensure the slug is unique to this user's lists (excluding current list)
        const { data: existingList, error: existingError } = await supabase
          .from('lists')
          .select('id')
          .eq('profile_id', profileId)
          .eq('slug', generatedSlug)
          .neq('id', listId)
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
      }

      // update the list
      const { data, error: updateError } = await supabase
        .from('lists')
        .update({
          name,
          slug: generatedSlug,
          description,
          private: isPrivate,
          password,
        })
        .eq('id', listId)
        .eq('profile_id', profileId)
        .select('*')
        .single()

      if (updateError) {
        throw new HTTPException(500, {
          message: updateError.message,
        })
      }

      return c.json<SuccessResponse<List>>({
        success: true,
        data,
      })
    },
  )
  .patch('/:profileSlug/:listSlug/status', async (c) => {
    const { profileSlug, listSlug } = c.req.param()
    const { status } = await c.req.json()

    // validate status
    if (!StatusType.safeParse(status).success) {
      throw new HTTPException(400, {
        message: 'Invalid status',
      })
    }

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const listId = await resolveListIdFromSlug(c, profileId, listSlug)

    const supabase = getSupabase(c)

    const { data, error: updateError } = await supabase
      .from('lists')
      .update({ status })
      .eq('id', listId)
      .eq('profile_id', profileId)
      .select()
      .single()

    if (updateError) {
      throw new HTTPException(500, {
        message: 'Failed to update list status',
      })
    }

    return c.json<SuccessResponse<List>>({
      success: true,
      data,
    })
  })
  .delete('/:profileSlug/:listSlug', async (c) => {
    const { profileSlug, listSlug } = c.req.param()

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const listId = await resolveListIdFromSlug(c, profileId, listSlug)

    const supabase = getSupabase(c)

    const { error: deleteError } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .eq('profile_id', profileId)

    if (deleteError) {
      throw new HTTPException(500, {
        message: 'Failed to delete the list',
      })
    }

    return c.body(null, 204)
  })
