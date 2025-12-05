import { useMutation } from '@tanstack/react-query'

import type {
  DirectUploadData,
  ErrorResponse,
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'
import type { DeleteImageOptions } from '@/lib/types'
import { hashFile } from '@/lib/utils'

/**
 * Get a direct upload URL from server (Cloudflare Images Direct Upload)
 */
export const getDirectUploadUrl = async (
  file: File,
  itemId?: string,
): Promise<DirectUploadData | { existingImageId: string }> => {
  const hash = await hashFile(file, itemId)

  const res = await client.images['direct-upload-url'].$post({
    json: { hash },
  })

  if (res.ok) {
    const { data } = (await res.json()) as
      | SuccessResponse<DirectUploadData>
      | SuccessResponse<{ existingImageId: string }>
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to create direct upload URL')
}

/**
 * Upload file to Cloudflare if it’s new, or return existing image ID
 */
export const uploadImageToCloudflare = async (
  file: File,
  itemId?: string,
): Promise<string> => {
  const result = await getDirectUploadUrl(file, itemId)

  // If the file already exists, just return the existing ID
  if ('existingImageId' in result) {
    return result.existingImageId
  }

  // Otherwise, perform the upload
  const { uploadURL, imageId } = result
  const formData = new FormData()
  formData.append('file', file)

  const uploadRes = await fetch(uploadURL, {
    method: 'POST',
    body: formData,
  })

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    throw new Error(`Upload failed: ${err}`)
  }

  return imageId
}

export const useUploadImageToCloudflare = () =>
  useMutation({
    mutationFn: ({ file, uniqueId }: { file: File; uniqueId?: string }) =>
      uploadImageToCloudflare(file, uniqueId),
  })

export const deleteImageFromSupabase = async (
  imageId: string,
  options?: DeleteImageOptions,
) => {
  const requestConfig: {
    param: { imageId: string }
    query?: { listItemId: string }
  } = {
    param: {
      imageId,
    },
  }

  if (options?.listItemId) {
    requestConfig.query = { listItemId: options.listItemId }
  }

  const res = await client.images[':imageId'].$delete(requestConfig)

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to delete image')
  }
}

export const useDeleteImageFromSupabase = () =>
  useMutation({
    mutationFn: ({
      imageId,
      listItemId,
    }: {
      imageId: string
      listItemId?: string
    }) => deleteImageFromSupabase(imageId, { listItemId }),
  })

export const deleteAvatarImageFromSupabase = async (avatarId: string) => {
  const res = await client.images.avatar[':avatarId'].$delete({
    param: {
      avatarId,
    },
  })

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to delete avatar image')
  }
}

export const useDeleteAvatarImageFromSupabase = () =>
  useMutation({
    mutationFn: deleteAvatarImageFromSupabase,
  })
