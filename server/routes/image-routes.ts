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

      // Check if hash already exists
      const { data: existing, error: existingError } = await supabase
        .from('images')
        .select('id')
        .eq('image_hash', hash)
        .maybeSingle()

      if (existingError) {
        throw new HTTPException(500, { message: existingError.message })
      }

      if (existing?.id) {
        return c.json<SuccessResponse<{ existingImageId: string }>>({
          success: true,
          data: { existingImageId: existing.id },
        })
      }

      // Otherwise request a new direct upload URL from Cloudflare
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

      const { uploadURL, id: imageId } = data.result

      // Store hash + image_id in Supabase for deduplication
      const { error: insertError } = await supabase.from('images').insert({
        id: imageId,
        image_hash: hash,
      })

      if (insertError) {
        console.error('Failed to insert image record:', insertError)
        // Don't throw here — CF image upload can still proceed.
      }

      // Return the direct upload URL + image ID
      return c.json<SuccessResponse<DirectUploadData>>({
        success: true,
        data: { uploadURL, imageId },
      })
    },
  )
  .delete('/:imageId', async (c) => {
    const { CF_ACCOUNT_ID, CF_IMAGES_API_TOKEN } = env<AppEnv>(c)
    const { imageId } = c.req.param()
    const supabase = getSupabase(c)

    // Step 1: Check if the image is still referenced by any list_items
    const { count, error: countError } = await supabase
      .from('list_items')
      .select('id', { count: 'exact', head: true })
      .eq('image_id', imageId)

    if (countError) {
      console.error('Failed to check image references:', countError)
      throw new HTTPException(500, {
        message: 'Error checking image references',
      })
    }

    if (count && count > 0) {
      // Image still in use somewhere — don’t delete globally
      console.log(
        `Image ${imageId} still referenced by ${count} list item(s). Skipping Cloudflare + DB delete.`,
      )
      return c.body(null, 204)
    }

    // Step 2: Safe to delete from Cloudflare
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${CF_IMAGES_API_TOKEN}`,
        },
      },
    )

    const data = (await res.json()) as { success: boolean }

    if (!data.success) {
      console.error('Cloudflare image delete error:', data)
      throw new HTTPException(500, { message: 'Failed to delete image' })
    }

    // Step 3: Delete from Supabase `images` table
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      console.error('Supabase image record delete error:', dbError)
      // Don't block Cloudflare success; just log it
    }

    return c.body(null, 204)
  })
