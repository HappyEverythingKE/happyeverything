import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import * as crypto from 'node:crypto'

import type {
  AppEnv,
  DirectUploadData,
  SuccessResponse,
} from '../../shared/types'
import { getSupabase } from '../middleware/auth.middleware'

export const imageRoutes = new Hono()
  // ── Existing: get a direct upload URL (for browser file uploads) ─────────
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

  // ── New: fetch a remote image URL and upload it to Cloudflare ────────────
  // Used by /add-item when the scraper returns an external imageUrl rather
  // than an imageId. Running this server-side avoids CORS issues and keeps
  // Cloudflare credentials off the client.
  .post(
    '/upload-from-url',
    zValidator('json', z.object({ imageUrl: z.string().url() })),
    async (c) => {
      const { CF_ACCOUNT_ID, CF_IMAGES_API_TOKEN } = env<AppEnv>(c)
      const supabase = getSupabase(c)
      const { imageUrl } = c.req.valid('json')

      // ── 1. Fetch the remote image ──────────────────────────────────────
      let imageBuffer: ArrayBuffer
      let contentType: string

      try {
        const fetchRes = await fetch(imageUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; HappyEverything/1.0; +https://myhappyeverything.com)',
            Accept: 'image/*,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(15_000),
        })

        if (!fetchRes.ok) {
          throw new HTTPException(422, {
            message: `Could not fetch image (status ${fetchRes.status})`,
          })
        }

        contentType = fetchRes.headers.get('content-type') ?? 'image/jpeg'

        if (!contentType.startsWith('image/')) {
          throw new HTTPException(422, {
            message: 'URL does not point to an image',
          })
        }

        const blob = await fetchRes.blob()

        if (blob.size > 5 * 1024 * 1024) {
          throw new HTTPException(422, { message: 'Image exceeds 5 MB limit' })
        }

        imageBuffer = await blob.arrayBuffer()
      } catch (err) {
        if (err instanceof HTTPException) throw err
        throw new HTTPException(422, {
          message: `Failed to retrieve image: ${String(err)}`,
        })
      }

      // ── 2. Hash for deduplication ──────────────────────────────────────
      const imageHash = crypto
        .createHash('sha256')
        .update(Buffer.from(imageBuffer))
        .digest('hex')

      // ── 3. Check if we already have this image ─────────────────────────
      const { data: existing, error: existingError } = await supabase
        .from('images')
        .select('id')
        .eq('image_hash', imageHash)
        .maybeSingle()

      if (existingError) {
        throw new HTTPException(500, { message: existingError.message })
      }

      if (existing?.id) {
        return c.json<SuccessResponse<{ imageId: string }>>({
          success: true,
          data: { imageId: existing.id },
        })
      }

      // ── 4. Get a Cloudflare direct upload URL ──────────────────────────
      const cfUrlRes = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/images/v2/direct_upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${CF_IMAGES_API_TOKEN}` },
        },
      )

      const cfUrlData = (await cfUrlRes.json()) as {
        success: boolean
        result: { uploadURL: string; id: string }
      }

      if (!cfUrlData.success) {
        console.error('Cloudflare upload URL error:', cfUrlData)
        throw new HTTPException(500, {
          message: 'Failed to get Cloudflare upload URL',
        })
      }

      const { uploadURL, id: imageId } = cfUrlData.result

      // ── 5. Upload the image buffer to Cloudflare ───────────────────────
      const ext = contentType.split('/')[1]?.split(';')[0] ?? 'jpg'
      const formData = new FormData()
      formData.append(
        'file',
        new Blob([imageBuffer], { type: contentType }),
        `image.${ext}`,
      )

      const uploadRes = await fetch(uploadURL, {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        console.error('Cloudflare upload failed:', await uploadRes.text())
        throw new HTTPException(500, {
          message: 'Image upload to Cloudflare failed',
        })
      }

      // ── 6. Record in Supabase for future deduplication ─────────────────
      const { error: insertError } = await supabase.from('images').insert({
        id: imageId,
        image_hash: imageHash,
      })

      if (insertError) {
        // Non-fatal — CF image exists, deduplication just won't work next time
        console.error('Failed to insert image record:', insertError)
      }

      return c.json<SuccessResponse<{ imageId: string }>>({
        success: true,
        data: { imageId },
      })
    },
  )

  // ── Existing: delete a list item image ───────────────────────────────────
  .delete('/:imageId', async (c) => {
    const { imageId } = c.req.param()
    const listItemId = c.req.query('listItemId')
    const supabase = getSupabase(c)

    // Check if image is still referenced by any other list_items
    let query = supabase
      .from('list_items')
      .select('id', { count: 'exact', head: true })
      .eq('image_id', imageId)

    if (listItemId) {
      query = query.neq('id', listItemId)
    }

    const { count, error: countError } = await query

    if (countError) {
      console.error('Failed to check image references:', countError)
      throw new HTTPException(500, {
        message: 'Error checking image references',
      })
    }

    if (count && count > 0) {
      console.log(
        `Image ${imageId} still referenced by ${count} list item(s). Skipping DB delete.`,
      )
      return c.body(null, 204)
    }

    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      console.error('Supabase image record delete error:', dbError)
    }

    return c.body(null, 204)
  })

  // ── Existing: delete an avatar image ─────────────────────────────────────
  .delete('avatar/:avatarId', async (c) => {
    const { avatarId } = c.req.param()
    const supabase = getSupabase(c)

    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', avatarId)

    if (dbError) {
      console.error('Supabase avatar image delete error:', dbError)
    }

    return c.body(null, 204)
  })
