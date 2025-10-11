import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { zValidator } from '@hono/zod-validator'
import slugify from '@sindresorhus/slugify'

import {
  ListCreateSchema,
  ListShareSchema,
  ListStatusType,
  type AppEnv,
  type List,
  type ListType,
  type ProfileGiftActivity,
  type SuccessResponse,
} from '../../../shared/types'
import {
  resolveListIdFromSlug,
  resolveProfileIdFromSlug,
} from '../../lib/slug-id-lookup'
import { mapToListType, mapToProfileGiftActivityType } from '../../lib/utils'
import { getSupabase } from '../../middleware/auth.middleware'

export const listRoutes = new Hono()
  .get('/list-types', async (c) => {
    const supabase = getSupabase(c)

    const { data, error } = await supabase
      .from('list_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw new HTTPException(500, {
        message: error.message,
      })
    }

    // Sort data to put "everything" first, then alphabetically
    const sortedData = data.sort((a, b) => {
      if (a.name.toLowerCase() === 'everything') return -1
      if (b.name.toLowerCase() === 'everything') return 1
      return a.name.localeCompare(b.name)
    })

    return c.json<SuccessResponse<ListType[]>>({
      success: true,
      data: sortedData.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.image_url,
        isCustom: item.is_custom,
      })),
    })
  })
  .get('/:profileSlug/activity', async (c) => {
    const { profileSlug } = c.req.param()
    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const supabase = getSupabase(c)

    const { data, error } = await supabase
      .from('profile_gift_activity')
      .select('gifter_name, created_at, list_name')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new HTTPException(500, {
        message: error.message,
      })
    }

    return c.json<SuccessResponse<ProfileGiftActivity[]>>({
      success: true,
      data: data.map(mapToProfileGiftActivityType) ?? [],
    })
  })
  .get('/:profileSlug', async (c) => {
    const { profileSlug } = c.req.param()
    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const supabase = getSupabase(c)

    const { data: allLists, error: listsError } = await supabase
      .from('lists')
      .select(
        'name, slug, description, private, password, status, created_at, updated_at, list_types!inner(id, name, image_url, is_custom)',
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
    const { name, description, listTypeId } = c.req.valid('form')

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
        list_type_id: listTypeId,
      })
      .select(
        'name, slug, description, private, password, status, created_at, list_types!inner(id, name, image_url, is_custom)',
      )
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
      .select(
        'name, slug, description, private, password, status, created_at, updated_at, list_types!inner(id, name, image_url, is_custom)',
      )
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
    zValidator('form', ListCreateSchema),
    async (c) => {
      const { profileSlug, listSlug } = c.req.param()

      const profileId = await resolveProfileIdFromSlug(c, profileSlug)
      const listId = await resolveListIdFromSlug(c, profileId, listSlug)

      const supabase = getSupabase(c)

      const { name, description, listTypeId } = c.req.valid('form')

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
          list_type_id: listTypeId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listId)
        .eq('profile_id', profileId)
        .select(
          'name, slug, description, private, password, status, created_at, updated_at, list_types!inner(id, name, image_url, is_custom)',
        )
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
    if (!ListStatusType.safeParse(status).success) {
      throw new HTTPException(400, {
        message: 'Invalid status',
      })
    }

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const listId = await resolveListIdFromSlug(c, profileId, listSlug)

    const supabase = getSupabase(c)

    const { data: updatedList, error: updateError } = await supabase
      .from('lists')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', listId)
      .eq('profile_id', profileId)
      .select(
        'name, slug, description, private, password, status, created_at, updated_at, list_types!inner(id, name, image_url, is_custom)',
      )
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
  .patch(
    '/:profileSlug/:listSlug/share',
    zValidator('form', ListShareSchema),
    async (c) => {
      const { profileSlug, listSlug } = c.req.param()
      const { isPrivate, password } = c.req.valid('form')

      const profileId = await resolveProfileIdFromSlug(c, profileSlug)
      const listId = await resolveListIdFromSlug(c, profileId, listSlug)

      // validate isPrivate
      if (isPrivate && !password) {
        throw new HTTPException(400, {
          message: 'Set a password to make your list private',
          cause: { form: true },
        })
      }

      const supabase = getSupabase(c)

      const { data: updatedList, error: updateError } = await supabase
        .from('lists')
        .update({
          private: isPrivate,
          password,
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('id', listId)
        .eq('profile_id', profileId)
        .select(
          'name, slug, description, private, password, status, created_at, updated_at, list_types!inner(id, name, image_url, is_custom)',
        )
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
