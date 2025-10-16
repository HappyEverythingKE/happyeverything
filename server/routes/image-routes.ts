import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { HTTPException } from 'hono/http-exception'

import { AppEnv, SuccessResponse } from '@shared/types'

export const imageRoutes = new Hono()
  .post('/direct-upload-url', async (c) => {
    const { CF_ACCOUNT_ID, CF_IMAGES_API_TOKEN } = env<AppEnv>(c)

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

    return c.json<SuccessResponse<{ uploadURL: string; imageId: string }>>({
      success: true,
      data: {
        uploadURL: data.result.uploadURL,
        imageId: data.result.id,
      },
    })
  })
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
