import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import {
  useDeleteImageFromSupabase,
  useUploadImageToCloudflare,
} from '@/services/image.api'
import { useCreateListItem } from '@/services/list-item.api'
import {
  scrapeProductFromUrl,
  scrapeProductFromScreenshot,
  type ScrapedProduct,
} from '@/services/scrape-product.api'
import { ListItemCreateSchema } from '@shared/types'
import { TrashIcon, WandSparkles, Link, Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { z } from 'zod'

import { getImageVariantUrl } from '@/lib/get-image-variant-url'
import { handleImageUpload } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShimmerImage } from '@/components/ui/shimmer-image'
import { Spinner } from '@/components/ui/spinner'
import { FieldInfo } from '@/components/field-info'

interface NewListItemFormProps {
  profileSlug: string
  listSlug: string
  onFormSubmit: () => void
  onFormCancel: () => void
}

const defaultValues = {
  name: '',
  quantity: 1,
  imageId: '',
  size: '',
  colour: '',
  shop: '',
  notes: '',
} as z.infer<typeof ListItemCreateSchema>

export function NewListItemForm({
  profileSlug,
  listSlug,
  onFormSubmit,
  onFormCancel,
}: NewListItemFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // ─── Auto Add state ───────────────────────────────────────────────
  const [showAutoAdd, setShowAutoAdd] = useState(false)
  const [autoAddMode, setAutoAddMode] = useState<'url' | 'screenshot' | null>(
    null,
  )
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [isScraping, setIsScraping] = useState(false)

  // create list item
  const { mutateAsync: createListItem, isPending } = useCreateListItem(
    profileSlug,
    listSlug,
  )

  // upload image to cloudflare
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadImageToCloudflare()

  // delete image from supabase
  const { mutateAsync: deleteImage, isPending: isDeletingImage } =
    useDeleteImageFromSupabase()

  // ─── Auto Add: apply scraped data to form ─────────────────────────
   const applyScrapedData = (product: ScrapedProduct) => {
    if (product.name) form.setFieldValue('name', product.name.slice(0, 150))
    if (product.shop) form.setFieldValue('shop', product.shop)
    if (product.size) form.setFieldValue('size', product.size.slice(0, 50))
    if (product.colour)
      form.setFieldValue('colour', product.colour.slice(0, 50))
    if (product.notes) form.setFieldValue('notes', product.notes.slice(0, 250))

    if (product.imageUrl) {
      // Extract Cloudflare Image ID from the URL so it persists to the DB
      const cfMatch = product.imageUrl.match(
        /imagedelivery\.net\/[^/]+\/([^/]+)/,
      )
      if (cfMatch) {
        const imageId = cfMatch[1]
        form.setFieldValue('imageId', imageId)
        setImageUrl(
          getImageVariantUrl({ imageId, context: 'thumbnail' }) ??
            product.imageUrl,
        )
      } else {
        // Non-Cloudflare URL — show as preview only
        setImageUrl(product.imageUrl)
      }
    }

    setShowAutoAdd(false)
    setAutoAddMode(null)
    setScrapeUrl('')

    toast.success('Product info extracted! Review and edit before saving.')
  }


  // ─── Auto Add: URL handler ────────────────────────────────────────
  const handleAutoAddByUrl = async () => {
    if (!scrapeUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }

    // Basic URL validation
    try {
      new URL(scrapeUrl)
    } catch {
      toast.error('Please enter a valid URL (e.g. https://example.com/product)')
      return
    }

    setIsScraping(true)
    try {
      const { success, product, error } = await scrapeProductFromUrl(scrapeUrl)
      if (success && product) {
        applyScrapedData(product)
      } else {
        toast.error(error || 'Could not extract product info from this URL')
      }
    } catch (err) {
      console.error('Scrape error:', err)
      toast.error(
        'Failed to scrape this page. Try uploading a screenshot instead.',
      )
    } finally {
      setIsScraping(false)
    }
  }

  // ─── Auto Add: Screenshot handler ─────────────────────────────────
  const handleAutoAddByScreenshot = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large. Maximum 10MB.')
      return
    }

    setIsScraping(true)
    try {
      const { success, product, error } =
        await scrapeProductFromScreenshot(file)
      if (success && product) {
        applyScrapedData(product)
      } else {
        toast.error(
          error || 'Could not extract product info from this screenshot',
        )
      }
    } catch (err) {
      console.error('Screenshot scrape error:', err)
      toast.error('Failed to extract product info from screenshot')
    } finally {
      setIsScraping(false)
      e.target.value = '' // reset input
    }
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const randomImageId = Math.floor(
        100000 + Math.random() * 900000,
      ).toString()

      await handleImageUpload({
        file,
        uploadImage: (file) => uploadImage({ file, uniqueId: randomImageId }),
        getImageVariantUrl,
        imageContext: 'thumbnail',
        onSuccess: (imageId, imageUrl) => {
          form.setFieldValue('imageId', imageId)
          setImageUrl(imageUrl)
        },
        onError: () => {
          e.target.value = ''
        },
      })
    } catch {
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const imageId = form.getFieldValue('imageId')

    if (!imageId) {
      // Just clear the preview (external URL from scraping)
      setImageUrl(null)
      return
    }

    try {
      await deleteImage({ imageId })
      form.setFieldValue('imageId', undefined)
      const fileInput = document.getElementById('itemImage') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
      setImageUrl(null)
      toast.warning("Don't forget to save your changes!")
    } catch (error) {
      toast.error('An error occurred.', { description: String(error) })
    }
  }

  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: ListItemCreateSchema },
    onSubmit: async ({ value }) => {
      const res = await createListItem(value)
      if (res.success) {
        toast.success('Gift Item Added.')
        onFormSubmit()
      } else {
        form.setErrorMap({
          // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
          onSubmit: res.error || 'An unexpected error occurred',
        })
      }
    },
  })

  return (
    <div className="flex h-full flex-col gap-12 md:grid md:grid-rows-[auto_1fr]">
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="flex flex-col gap-8">
          {/* ─── Auto Add Section ─────────────────────────────────── */}
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
            <button
              type="button"
              onClick={() => {
                setShowAutoAdd(!showAutoAdd)
                if (!showAutoAdd) setAutoAddMode(null)
              }}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <WandSparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">
                  Auto Add from URL or Screenshot
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {showAutoAdd ? 'Close' : 'Expand'}
              </span>
            </button>

            {showAutoAdd && (
              <div className="mt-4 space-y-4">
                {/* Mode selector */}
                {!autoAddMode && (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoAddMode('url')}
                      className="flex-1"
                    >
                      <Link className="mr-2 h-3.5 w-3.5" />
                      Paste URL
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAutoAddMode('screenshot')}
                      className="flex-1"
                    >
                      <Camera className="mr-2 h-3.5 w-3.5" />
                      Upload Screenshot
                    </Button>
                  </div>
                )}

                {/* URL mode */}
                {autoAddMode === 'url' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://www.jumia.co.ke/product..."
                        value={scrapeUrl}
                        onChange={(e) => setScrapeUrl(e.target.value)}
                        disabled={isScraping}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAutoAddByUrl()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAutoAddByUrl}
                        disabled={isScraping || !scrapeUrl.trim()}
                      >
                        {isScraping ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Fetch'
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAutoAddMode(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        ← Back
                      </button>
                      {isScraping && (
                        <p className="text-xs text-amber-600">
                          Extracting product info...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Screenshot mode */}
                {autoAddMode === 'screenshot' && (
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={isScraping}
                      onChange={handleAutoAddByScreenshot}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAutoAddMode(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        ← Back
                      </button>
                      {isScraping && (
                        <p className="text-xs text-amber-600">
                          Analyzing screenshot...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Name field ───────────────────────────────────────── */}
          <div className="space-y-3">
            <form.Field
              name="name"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>
                      Item name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={!field.state.meta.isValid}
                      placeholder="Keep it short and sweet (e.g. wireless headphones)"
                      maxLength={150}
                    />
                    <p className="-mt-1 ml-1 text-xs text-gray-500">
                      {field.state.value.length}/150 characters
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          {/* ─── Quantity field ────────────────────────────────────── */}
          <div className="space-y-3">
            <form.Field
              name="quantity"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>
                      Quantity <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="number"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      aria-invalid={!field.state.meta.isValid}
                      placeholder="Enter a number"
                    />
                    <p className="-mt-1 ml-1 text-xs text-gray-500">
                      Tip: If the item comes in a pack such as a 6-pack of
                      glasses, you can indicate 1.
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          {/* ─── Shop / Where to buy field ─────────────────────────── */}
          <div className="space-y-3">
            <form.Field
              name="shop"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>Where to buy</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Paste the product URL or shop name (e.g. Carrefour)"
                    />
                    <p className="-mt-1 text-xs text-gray-500">
                      Add a website URL or shop name to help others find it
                      easily.
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          {/* ─── Image upload ──────────────────────────────────────── */}
          <div className="space-y-3">
            <Label htmlFor="itemImage">Add item image</Label>
            {imageUrl ? (
              <div className="relative max-w-fit">
                <ShimmerImage
                  className="h-12 w-12 md:h-16 md:w-16"
                  src={imageUrl}
                  alt="Item thumbnail"
                  width={48}
                  height={48}
                  imgClassName="rounded-sm object-contain"
                />
                <div className="absolute -right-10 top-0">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteImage}
                    disabled={isDeletingImage}
                    className="size-6"
                  >
                    {isDeletingImage ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <TrashIcon className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Input
                  id="itemImage"
                  type="file"
                  accept="image/*"
                  disabled={isUploadingImage}
                  onChange={handleUploadImage}
                />

                {isUploadingImage ? (
                  <p className="-mt-1 ml-1 text-xs text-amber-600">
                    Uploading image...
                  </p>
                ) : (
                  <p className="-mt-1 ml-1 text-xs text-gray-500">
                    Upload a photo of your gift (JPG or PNG).
                  </p>
                )}
              </>
            )}
          </div>

          {/* ─── Size field ────────────────────────────────────────── */}
          <div className="space-y-3">
            <form.Field
              name="size"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>Size</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Example shoe size:  UK 9 Men's"
                      aria-invalid={!field.state.meta.isValid}
                      maxLength={50}
                    />
                    <p className="-mt-1 ml-1 text-xs text-gray-500">
                      {field.state.value?.length ?? 0}/50 characters
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          {/* ─── Colour field ──────────────────────────────────────── */}
          <div className="space-y-3">
            <form.Field
              name="colour"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>Colour</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Dark green"
                      aria-invalid={!field.state.meta.isValid}
                      maxLength={50}
                    />
                    <p className="-mt-1 ml-1 text-xs text-gray-500">
                      {field.state.value?.length ?? 0}/50 characters
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          {/* ─── Notes field ───────────────────────────────────────── */}
          <div className="space-y-3">
            <form.Field
              name="notes"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>Notes</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Add helpful notes here"
                      aria-invalid={!field.state.meta.isValid}
                      maxLength={250}
                    />
                    <p className="-mt-1 ml-1 text-xs text-gray-500">
                      {field.state.value?.length ?? 0}/250 characters
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          {/* Error alerts */}
          <form.Subscribe
            selector={(state) => [state.errorMap]}
            children={([errorMap]) =>
              errorMap.onSubmit ? (
                <div className="border-destructive/50 max-w-sm rounded-md border bg-red-50 p-3 md:p-4">
                  <p className="overflow-auto text-clip text-pretty text-sm font-medium text-red-800">
                    {errorMap.onSubmit}
                  </p>
                </div>
              ) : null
            }
          />
        </div>

        {/* Form submission */}
        <div className="mt-auto pb-8">
          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.isPristine,
            ]}
            children={([canSubmit, isPristine]) => (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onFormCancel}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={!canSubmit || isPristine || isPending}
                >
                  {isPending ? 'Working...' : 'Save'}
                </Button>
              </div>
            )}
          />
        </div>
      </form>
    </div>
  )
}
