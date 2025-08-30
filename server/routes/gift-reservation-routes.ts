import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { getSupabase } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'

import {
  GiftReservationCreateSchema,
  type GiftReservationType,
  type SuccessResponse,
} from '@/shared/types'

export const giftReservationRoutes = new Hono()
  // create reservation (anonymous gifter)
  .post(
    '/:itemPublicId',
    zValidator('form', GiftReservationCreateSchema),
    async (c) => {
      const { itemPublicId } = c.req.param()
      const { gifterName, quantityReserved } = c.req.valid('form')

      const supabase = getSupabase(c)

      const { data: listItem, error: lookupError } = await supabase
        .from('list_items')
        .select('id, quantity')
        .eq('public_id', itemPublicId)
        .single()

      if (lookupError || !listItem) {
        console.error('lookupError', lookupError)
        throw new HTTPException(404, { message: 'List item not found' })
      }

      // check total already reserved
      const { data: existing, error: reserveError } = await supabase
        .from('gift_reservations')
        .select('quantity_reserved')
        .eq('list_item_id', listItem.id)

      if (reserveError) {
        console.error('reserveError', reserveError)
        throw new HTTPException(500, { message: reserveError.message })
      }

      const alreadyReserved = (existing ?? []).reduce(
        (sum, r) => sum + Number(r.quantity_reserved),
        0,
      )

      if (alreadyReserved + quantityReserved > Number(listItem.quantity)) {
        throw new HTTPException(400, {
          message: 'This item is fully gifted',
        })
      }

      // insert reservation
      const { data: reservation, error: insertError } = await supabase
        .from('gift_reservations')
        .insert({
          list_item_id: listItem.id,
          gifter_name: gifterName || null,
          quantity_reserved: quantityReserved,
        })
        .select('*')
        .single()

      if (insertError) {
        console.error('insertError', insertError)
        throw new HTTPException(500, { message: insertError.message })
      }

      return c.json<SuccessResponse<GiftReservationType>>({
        success: true,
        data: {
          gifterName: reservation.gifter_name,
          quantityReserved: reservation.quantity_reserved,
          createdAt: reservation.created_at,
        },
      })
    },
  )
