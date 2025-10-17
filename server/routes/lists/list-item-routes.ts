import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { zValidator } from '@hono/zod-validator'

import {
  ListItemCreateSchema,
  TopPickSchema,
  type AppEnv,
  type ListItem,
  type SuccessResponse,
} from '../../../shared/types'
import {
  resolveListIdFromSlug,
  resolveProfileIdFromSlug,
} from '../../lib/slug-id-lookup'
import { mapToListItemType } from '../../lib/utils'
import { getSupabase } from '../../middleware/auth.middleware'

export const listItemRoutes = new Hono()
  .get('/:profileSlug/:listSlug/items', async (c) => {
    const { profileSlug, listSlug } = c.req.param()

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const listId = await resolveListIdFromSlug(c, profileId, listSlug)

    const supabase = getSupabase(c)

    // fetch items from view
    const { data, error } = await supabase
      .from('list_items_with_counts_and_gifters')
      .select('*')
      .eq('list_id', listId)
      .order('still_needs', { ascending: false })
      .order('top_pick', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw new HTTPException(500, {
        message: error.message,
      })
    }

    return c.json<SuccessResponse<ListItem[]>>({
      success: true,
      data: data.map(mapToListItemType),
    })
  })
  .post(
    '/:profileSlug/:listSlug/items',
    zValidator('form', ListItemCreateSchema),
    async (c) => {
      const { profileSlug, listSlug } = c.req.param()

      const profileId = await resolveProfileIdFromSlug(c, profileSlug)
      const listId = await resolveListIdFromSlug(c, profileId, listSlug)

      const supabase = getSupabase(c)
      const { name, quantity, size, colour, imageId, shop, notes } =
        c.req.valid('form')

      const normalize = (v: unknown) =>
        typeof v === 'string' && v.trim() !== '' && v !== 'undefined' ? v : null

      const { data: insertedData, error: insertError } = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          image_id: normalize(imageId),
          name,
          quantity,
          size,
          colour,
          shop,
          notes,
        })
        .select('id')
        .single()

      if (insertError) {
        throw new HTTPException(500, {
          message: insertError.message,
          cause: { form: true },
        })
      }

      // Fetch the newly created item from the same view used by GET to ensure consistent data structure
      const { data, error: fetchError } = await supabase
        .from('list_items_with_counts_and_gifters')
        .select('*')
        .eq('id', insertedData.id)
        .eq('list_id', listId)
        .single()

      if (fetchError) {
        throw new HTTPException(500, {
          message: fetchError.message,
          cause: { form: true },
        })
      }

      return c.json<SuccessResponse<ListItem>>({
        success: true,
        data: mapToListItemType(data),
      })
    },
  )
  .patch(
    '/:profileSlug/:listSlug/items/:itemId',
    zValidator('form', ListItemCreateSchema),
    async (c) => {
      const { profileSlug, listSlug, itemId } = c.req.param()

      const profileId = await resolveProfileIdFromSlug(c, profileSlug)
      const listId = await resolveListIdFromSlug(c, profileId, listSlug)

      const supabase = getSupabase(c)

      const { name, quantity, size, colour, imageId, shop, notes } =
        c.req.valid('form')

      const normalize = (v: unknown) =>
        typeof v === 'string' && v.trim() !== '' && v !== 'undefined' ? v : null

      const { error: updateError } = await supabase
        .from('list_items')
        .update({
          name,
          quantity,
          size,
          colour,
          image_id: normalize(imageId), // allow replace or remove
          shop,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('list_id', listId)

      if (updateError) {
        throw new HTTPException(500, {
          message: updateError.message,
          cause: { form: true },
        })
      }

      const { data, error: fetchError } = await supabase
        .from('list_items_with_counts_and_gifters')
        .select('*')
        .eq('id', itemId)
        .eq('list_id', listId)
        .single()

      if (fetchError) {
        throw new HTTPException(500, {
          message: fetchError.message,
          cause: { form: true },
        })
      }

      return c.json<SuccessResponse<ListItem>>({
        success: true,
        data: mapToListItemType(data),
      })
    },
  )
  .patch(
    '/:profileSlug/:listSlug/items/:itemId/priority',
    zValidator('form', TopPickSchema),
    async (c) => {
      const { profileSlug, listSlug, itemId } = c.req.param()
      const { topPick } = c.req.valid('form')

      const supabase = getSupabase(c)

      const profileId = await resolveProfileIdFromSlug(c, profileSlug)
      const listId = await resolveListIdFromSlug(c, profileId, listSlug)

      // check if adding another top pick would exceed the limit
      if (topPick === true) {
        const { count, error: countError } = await supabase
          .from('list_items')
          .select('*', { count: 'exact', head: true })
          .eq('list_id', listId)
          .eq('top_pick', true)

        if (countError) {
          throw new HTTPException(500, {
            message: countError.message,
            cause: { form: true },
          })
        }

        const { MAX_TOP_PICKS_PER_LIST } = env<AppEnv>(c)

        if ((count ?? 0) >= MAX_TOP_PICKS_PER_LIST) {
          throw new HTTPException(400, {
            message: `You can have up to ${MAX_TOP_PICKS_PER_LIST} top picks per list`,
            cause: { form: true },
          })
        }
      }

      const { error: updateError } = await supabase
        .from('list_items')
        .update({ top_pick: topPick, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .eq('list_id', listId)

      if (updateError) {
        throw new HTTPException(500, {
          message: updateError.message,
        })
      }

      const { data, error: fetchError } = await supabase
        .from('list_items_with_counts_and_gifters')
        .select('*')
        .eq('id', itemId)
        .eq('list_id', listId)
        .single()

      if (fetchError) {
        throw new HTTPException(500, {
          message: fetchError.message,
        })
      }

      return c.json<SuccessResponse<ListItem>>({
        success: true,
        data: mapToListItemType(data),
      })
    },
  )
  .delete('/:profileSlug/:listSlug/items/:itemId', async (c) => {
    const { profileSlug, listSlug, itemId } = c.req.param()

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const listId = await resolveListIdFromSlug(c, profileId, listSlug)

    const supabase = getSupabase(c)

    const { error: deleteError } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)
      .eq('list_id', listId)

    if (deleteError) {
      throw new HTTPException(500, { message: deleteError.message })
    }

    return c.body(null, 204)
  })
