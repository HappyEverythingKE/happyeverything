type ImageContext =
  | 'marketing-large'
  | 'marketing-medium'
  | 'marketing-thumb'
  | 'avatar-thumb'
  | 'avatar-medium'
  | 'list-item'
  | 'thumbnail'

interface UseImageVariantOptions {
  imageId?: string // Cloudflare image ID (from upload response)
  context: ImageContext
}

/**
 * Returns a Cloudflare Images variant URL based on usage context.
 * Example usage:
 *   const imageUrl = useImageVariant({ imageId, context: 'avatar-thumb' })
 */
export function useImageVariant({
  imageId,
  context,
}: UseImageVariantOptions): string | null {
  if (!imageId) return null

  const ACCOUNT_HASH = import.meta.env.VITE_CF_IMAGE_ACCOUNT_HASH

  // Variant map
  const variantMap: Record<ImageContext, string> = {
    'marketing-large': 'marketingLarge',
    'marketing-medium': 'marketingMedium',
    'marketing-thumb': 'marketingThumb',
    'avatar-thumb': 'avatarThumb',
    'avatar-medium': 'avatarMedium',
    'list-item': 'listItem',
    thumbnail: 'thumbnail',
  }

  const variant = variantMap[context]

  return `${import.meta.env.VITE_CF_IMAGES_API_URL}/${ACCOUNT_HASH}/${imageId}/${variant}`
}
