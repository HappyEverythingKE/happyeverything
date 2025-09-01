import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { getSupabase } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'

import {
  ListItemCreateSchema,
  TopPickSchema,
  type AppEnv,
  type ListItem,
  type SuccessResponse,
} from '@/shared/types'
import { resolveListItemIdFromPublicId } from '@/lib/public-id-lookup'
import {
  resolveListIdFromSlug,
  resolveProfileIdFromSlug,
} from '@/lib/slug-id-lookup'
import { mapToListItemType } from '@/lib/utils'

export const listItemRoutes = new Hono()
  .get('/:profileSlug/:listSlug/items', async (c) => {
    const { profileSlug, listSlug } = c.req.param()

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const listId = await resolveListIdFromSlug(c, profileId, listSlug)

    const supabase = getSupabase(c)

    const { data, error } = await supabase
      .from('list_items')
      .select(
        'public_id, name, quantity, size, colour, image_url, product_url, shop_name, top_pick, created_at, updated_at',
      )
      .eq('list_id', listId)
      .order('top_pick', { ascending: false })
      .order('created_at', { ascending: true })

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
      const { name, quantity, size, colour, imageUrl, productUrl, shopName } =
        c.req.valid('form')

      const { data, error: insertError } = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          name,
          quantity,
          size,
          colour,
          image_url: imageUrl,
          product_url: productUrl,
          shop_name: shopName,
        })
        .select(
          'public_id, name, quantity, size, colour, image_url, product_url, shop_name, top_pick, created_at, updated_at',
        )
        .single()

      if (insertError) {
        throw new HTTPException(500, {
          message: insertError.message,
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
    '/:profileSlug/:listSlug/items/:itemPublicId',
    zValidator('form', ListItemCreateSchema),
    async (c) => {
      const { profileSlug, listSlug, itemPublicId } = c.req.param()

      const profileId = await resolveProfileIdFromSlug(c, profileSlug)
      const listId = await resolveListIdFromSlug(c, profileId, listSlug)
      const itemId = await resolveListItemIdFromPublicId(c, itemPublicId)

      const supabase = getSupabase(c)

      const { name, quantity, size, colour, imageUrl, productUrl, shopName } =
        c.req.valid('form')

      const { data, error: updateError } = await supabase
        .from('list_items')
        .update({
          name,
          quantity,
          size: size || null,
          colour: colour || null,
          image_url: imageUrl || null,
          product_url: productUrl || null,
          shop_name: shopName || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('list_id', listId)
        .select(
          'public_id, name, quantity, size, colour, image_url, product_url, shop_name, top_pick, created_at, updated_at',
        )
        .single()

      if (updateError) {
        throw new HTTPException(500, {
          message: updateError.message,
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
    '/:profileSlug/:listSlug/items/:itemPublicId/priority',
    zValidator('form', TopPickSchema),
    async (c) => {
      const { profileSlug, listSlug, itemPublicId } = c.req.param()
      const { topPick } = c.req.valid('form')

      const supabase = getSupabase(c)

      const profileId = await resolveProfileIdFromSlug(c, profileSlug)
      const listId = await resolveListIdFromSlug(c, profileId, listSlug)
      const itemId = await resolveListItemIdFromPublicId(c, itemPublicId)

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

      const { data, error: updateError } = await supabase
        .from('list_items')
        .update({ top_pick: topPick, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .eq('list_id', listId)
        .select(
          'public_id, name, quantity, size, colour, image_url, product_url, shop_name, top_pick, created_at, updated_at',
        )
        .single()

      if (updateError) {
        throw new HTTPException(500, {
          message: updateError.message,
        })
      }

      return c.json<SuccessResponse<ListItem>>({
        success: true,
        data: mapToListItemType(data),
      })
    },
  )
  .delete('/:profileSlug/:listSlug/items/:itemPublicId', async (c) => {
    const { profileSlug, listSlug, itemPublicId } = c.req.param()

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const listId = await resolveListIdFromSlug(c, profileId, listSlug)
    const itemId = await resolveListItemIdFromPublicId(c, itemPublicId)

    const supabase = getSupabase(c)

    const { error: deleteError } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)
      .eq('list_id', listId)

    if (deleteError) {
      throw new HTTPException(500, {
        message: deleteError.message,
      })
    }

    return c.body(null, 204)
  })
// .patch(
//   '/:profileSlug/:listSlug/items/:itemId/status',
//   zValidator('form', GiftedBySchema),
//   async (c) => {
//     const { profileSlug, listSlug, itemId } = c.req.param()

//     const profileId = await resolveProfileIdFromSlug(c, profileSlug)
//     const listId = await resolveListIdFromSlug(c, profileId, listSlug)

//     const supabase = getSupabase(c)
//     const { giftedBy, quantityGifted } = c.req.valid('form')

//     const { data, error: updateError } = await supabase
//       .from('list_items')
//       .update({
//         status: 'gifted',
//         gifted_by: giftedBy,
//         quantity_gifted: quantityGifted,
//       })
//       .eq('id', itemId)
//       .eq('list_id', listId)
//       .select('*')
//       .single()

//     if (updateError) {
//       throw new HTTPException(500, {
//         message: updateError.message,
//       })
//     }

//     return c.json<SuccessResponse<ListItem>>({
//       success: true,
//       data: mapToListItemType(data),
//     })
//   },
// )
