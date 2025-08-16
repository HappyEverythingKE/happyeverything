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
  type ListType,
  type SuccessResponse,
} from '@/shared/types'
import {
  resolveListIdFromSlug,
  resolveProfileIdFromSlug,
} from '@/lib/slug-id-lookup'
import { mapToListType } from '@/lib/utils'

export const listRoutes = new Hono()
  .get('/list-type/search', async (c) => {
    const { q } = c.req.query()
    const supabase = getSupabase(c)

    let supabaseQuery = supabase
      .from('list_types_view')
      .select('name')
      .order('name', { ascending: true })

    if (q) {
      supabaseQuery = supabaseQuery.ilike('name', `%${q}%`)
    }
    const { data, error } = await supabaseQuery

    if (error) {
      console.error('Error fetching list types:', error)
      return
    }

    return c.json<SuccessResponse<ListType[]>>({
      success: true,
      data,
    })
  })
  .get('/:profileSlug', async (c) => {
    const { profileSlug } = c.req.param()
    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const supabase = getSupabase(c)

    const { data: allLists, error: listsError } = await supabase
      .from('lists')
      .select(
        'name, slug, list_type, description, private, password, status, created_at',
      )
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (listsError) {
      throw new HTTPException(500, {
        message: listsError.message,
      })
    }

    return c.json<SuccessResponse<List[]>>({
      success: true,
      data: allLists.map(mapToListType),
    })
  })
  .post('/:profileSlug', zValidator('form', ListCreateSchema), async (c) => {
    const { profileSlug } = c.req.param()
    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const supabase = getSupabase(c)
    const { name, description, listType } = c.req.valid('form')

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
    const { data: newList, error: insertError } = await supabase
      .from('lists')
      .insert({
        profile_id: profileId,
        name,
        slug: generatedSlug,
        description: description,
        list_type: listType,
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
        data: mapToListType(newList),
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
      data: mapToListType(list),
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

      const { name, description, listType, isPrivate, password } =
        c.req.valid('form')

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
      const { data: updatedList, error: updateError } = await supabase
        .from('lists')
        .update({
          name,
          slug: generatedSlug,
          description,
          list_type: listType,
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
        data: mapToListType(updatedList),
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

    const { data: updatedList, error: updateError } = await supabase
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
      data: mapToListType(updatedList),
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
