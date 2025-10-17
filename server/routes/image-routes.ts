import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { getSupabase } from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'
import { AppEnv, DirectUploadData, SuccessResponse } from '@shared/types'
import { z } from 'zod'

export const imageRoutes = new Hono()
  .post(
    '/direct-upload-url',
    zValidator('json', z.object({ hash: z.string() })),
    async (c) => {
      const { CF_ACCOUNT_ID, CF_IMAGES_API_TOKEN } = env<AppEnv>(c)
      const supabase = getSupabase(c)
      const { hash } = c.req.valid('json')
      console.log('hash', hash)

      // Check if hash already exists
      const { data: existing } = await supabase
        .from('images')
        .select('image_id')
        .eq('image_hash', hash)
        .maybeSingle()

      if (existing?.image_id) {
        return c.json<SuccessResponse<{ existingImageId: string }>>({
          success: true,
          data: { existingImageId: existing.image_id },
        })
      }

      // Otherwise request a new direct upload URL
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v2/direct_upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${CF_IMAGES_API_TOKEN}`,
          },
        },
      )

      const data = (await res.json()) as {
        success: boolean
        result: { uploadURL: string; id: string }
      }

      if (!data.success) {
        console.error('Cloudflare upload URL error:', data)
        throw new HTTPException(500, { message: 'Failed to create upload URL' })
      }

      return c.json<SuccessResponse<DirectUploadData>>({
        success: true,
        data: { uploadURL: data.result.uploadURL, imageId: data.result.id },
      })
    },
  )
  .delete('/:imageId', async (c) => {
    const { CF_ACCOUNT_ID, CF_IMAGES_API_TOKEN } = env<AppEnv>(c)
    const { imageId } = c.req.param()

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${CF_IMAGES_API_TOKEN}`,
        },
      },
    )

    const data = (await res.json()) as {
      success: boolean
    }

    if (!data.success) {
      console.error('Cloudflare image delete error:', data)
      throw new HTTPException(500, { message: 'Failed to delete image' })
    }

    return c.body(null, 204)
  })
