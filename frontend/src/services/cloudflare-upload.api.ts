import { useMutation } from '@tanstack/react-query'

import type {
  DirectUploadData,
  ErrorResponse,
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'
import { hashFile } from '@/lib/utils'

/**
 * Get a direct upload URL from server (Cloudflare Images Direct Upload)
 */
export const getDirectUploadUrl = async (
  file: File,
): Promise<DirectUploadData | { existingImageId: string }> => {
  const hash = await hashFile(file)

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
export const uploadImageToCloudflare = async (file: File): Promise<string> => {
  const result = await getDirectUploadUrl(file)

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
    mutationFn: uploadImageToCloudflare,
  })

export const deleteImageFromCloudflare = async (imageId: string) => {
  const res = await client.images[':imageId'].$delete({
    param: {
      imageId,
    },
  })

  if (!res.ok) {
    const data = (await res.json()) as ErrorResponse
    throw new Error(data.error ?? 'Failed to delete image from Cloudflare')
  }
}

export const useDeleteImageFromCloudflare = () =>
  useMutation({
    mutationFn: deleteImageFromCloudflare,
  })
