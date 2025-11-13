import { useEffect, useState } from 'react'

import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '@shared/types'
import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { countries } from 'countries-list'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

import type { ImageContext } from '@/lib/types'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

// Debounce helper
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debounced
}

export const prettifyInitials = (name: string | undefined) => {
  if (!name) return '^_^'

  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export const populateCountries = () => {
  const formattedCountries = Object.entries(countries).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_code, country]) => {
      return { label: country.name, value: country.name }
    },
  )

  return formattedCountries
}

export const hashFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

interface HandleImageUploadOptions {
  file: File
  uploadImage: (file: File) => Promise<string>
  getImageVariantUrl: (params: {
    imageId: string
    context: ImageContext
  }) => string | null
  imageContext: ImageContext
  onSuccess: (imageId: string, imageUrl: string | null) => void
  onError?: (error: unknown) => void
  maxFileSizeBytes?: number
  maxFileSizeMB?: number
}

/**
 * Reusable function to handle image upload with validation.
 * Validates file size and type, uploads the image, and calls the success callback.
 */
export const handleImageUpload = async ({
  file,
  uploadImage,
  getImageVariantUrl,
  imageContext,
  onSuccess,
  onError,
  maxFileSizeBytes = MAX_FILE_SIZE_BYTES,
  maxFileSizeMB = MAX_FILE_SIZE_MB,
}: HandleImageUploadOptions): Promise<void> => {
  try {
    // Validate file size
    if (file.size > maxFileSizeBytes) {
      toast.error(`Image is too large. Maximum size is ${maxFileSizeMB}MB.`)
      throw new Error(`File size exceeds ${maxFileSizeMB}MB limit`)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG or PNG).')
      throw new Error('Invalid file type')
    }

    // Upload the image
    const imageId = await uploadImage(file)
    const imageUrl = getImageVariantUrl({
      imageId,
      context: imageContext,
    })
    toast.success('Image uploaded successfully!')
    onSuccess(imageId, imageUrl)
  } catch (error) {
    if (onError) {
      onError(error)
    } else {
      toast.error('Image upload failed.')
      console.error(error)
    }
    throw error
  }
}
