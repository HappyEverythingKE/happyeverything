import { useMutation } from '@tanstack/react-query'

import type {
  DirectUploadData,
  ErrorResponse,
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'

/**
 * Get a direct upload URL from server (Cloudflare Images Direct Upload)
 */
export const getDirectUploadUrl = async (): Promise<DirectUploadData> => {
  const res = await client.images['direct-upload-url'].$post({})

  if (res.ok) {
    const { data } = (await res.json()) as SuccessResponse<DirectUploadData>
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  throw new Error(data.error ?? 'Failed to create direct upload URL')
}

/**
 * Upload file to Cloudflare and return the image ID
 */
export const uploadImageToCloudflare = async (file: File): Promise<string> => {
  const { uploadURL, imageId } = await getDirectUploadUrl()

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

  // return image ID to save to the database
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
