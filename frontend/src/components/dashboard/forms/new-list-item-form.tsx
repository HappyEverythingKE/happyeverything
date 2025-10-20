import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import {
  useDeleteImageFromCloudflare,
  useUploadImageToCloudflare,
} from '@/services/cloudflare-upload.api'
import { useCreateListItem } from '@/services/list-item.api'
import {
  ListItemCreateSchema,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@shared/types'
import { TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { z } from 'zod'

import { getImageVariantUrl } from '@/lib/get-image-variant-url'
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

  // create list item
  const { mutateAsync: createListItem, isPending } = useCreateListItem(
    profileSlug,
    listSlug,
  )

  // upload image to cloudflare
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadImageToCloudflare()

  // delete image from cloudflare
  const { mutateAsync: deleteImage, isPending: isDeletingImage } =
    useDeleteImageFromCloudflare()

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(
          `Image is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
        )
        e.target.value = '' // reset input so user can re-select
        return
      }

      // Validate file type again (for extra safety)
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPG or PNG).')
        e.target.value = ''
        return
      }

      const imageId = await uploadImage(file)
      form.setFieldValue('imageId', imageId)
      setImageUrl(
        getImageVariantUrl({
          imageId,
          context: 'thumbnail',
        }),
      )
      toast.success('Image uploaded successfully!')
    } catch (error) {
      toast.error('Image upload failed.')
      console.error(error)
    }
  }

  const handleDeleteImage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const imageId = form.getFieldValue('imageId')

    if (!imageId) return

    try {
      await deleteImage(imageId)
      // clear the image id, input field and image thumbnail
      form.setFieldValue('imageId', undefined)
      const fileInput = document.getElementById('itemImage') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
      setImageUrl(null)
      toast.success('Image deleted successfully.')
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
                      placeholder="Example shoe size:  UK 9 Men’s"
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
