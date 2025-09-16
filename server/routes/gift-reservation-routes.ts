import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { getAdminSupabase } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'

import {
  GiftReservationCreateSchema,
  type ReserveGiftResponse,
  type SuccessResponse,
} from '@/shared/types'

export const giftReservationRoutes = new Hono().post(
  '/:itemPublicId',
  zValidator('form', GiftReservationCreateSchema),
  async (c) => {
    const { itemPublicId } = c.req.param()
    const { gifterName, quantityReserved } = c.req.valid('form')

    const supabaseAdmin = getAdminSupabase(c)

    // wrap the insert inside a transaction to avoid race conditions
    const { data, error } = await supabaseAdmin.rpc(
      'reserve_gift_transaction',
      {
        p_item_public_id: itemPublicId,
        p_quantity_reserved: quantityReserved,
        p_gifter_name: gifterName ?? null,
      },
    )

    if (error || !data || data.length === 0) {
      throw new HTTPException(500, {
        message: error?.message ?? 'Reservation failed',
      })
    }

    const result = data[0]

    return c.json<SuccessResponse<ReserveGiftResponse>>({
      success: true,
      data: {
        item: {
          publicId: result.item_public_id,
          quantityReserved: quantityReserved,
          stillNeeds: result.still_needs,
        },
      },
    })
  },
)
