import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import {
  useDeleteImageFromCloudflare,
  useUploadImageToCloudflare,
} from '@/services/cloudflare-upload.api'
import { useDeleteListItem, useUpdateListItem } from '@/services/list-item.api'
import { ListItemCreateSchema, type ListItem } from '@shared/types'
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

interface EditListItemFormProps {
  profileSlug: string
  listSlug: string
  listItem: ListItem
  onFormSubmit: () => void
  onFormCancel: () => void
}

export function EditListItemForm({
  profileSlug,
  listSlug,
  listItem,
  onFormSubmit,
  onFormCancel,
}: EditListItemFormProps) {
  const navigate = useNavigate()
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // upload image to cloudflare
  const { mutateAsync: uploadImage, isPending: isUploadingImage } =
    useUploadImageToCloudflare()

  // update list item
  const { mutateAsync: updateListItem, isPending } = useUpdateListItem(
    profileSlug,
    listSlug,
    listItem.id,
  )

  // delete image from cloudflare
  const { mutateAsync: deleteImage, isPending: isDeletingImage } =
    useDeleteImageFromCloudflare()

  // delete list item
  const { mutateAsync: deleteListItem, isPending: isDeleting } =
    useDeleteListItem(profileSlug, listSlug, listItem.id)

  const handleDeleteItem = async () => {
    try {
      await deleteListItem()
      if (listItem.imageId) {
        deleteImage(listItem.imageId)
      }
      toast.success('Gift Item Deleted.')
      navigate({
        to: '/dashboard/$profileSlug/$listSlug',
        params: { profileSlug, listSlug: listSlug },
      })
      onFormCancel()
    } catch (error) {
      toast.error('An error occurred.', {
        description: String(error),
      })
    }
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
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

  useEffect(() => {
    if (listItem.imageId) {
      setImageUrl(
        getImageVariantUrl({
          imageId: listItem.imageId,
          context: 'thumbnail',
        }),
      )
    }
  }, [listItem.imageId, setImageUrl])

  const form = useForm({
    defaultValues: {
      name: listItem.name,
      quantity: listItem.quantity,
      imageId: listItem.imageId ?? '',
      size: listItem.size ?? '',
      colour: listItem.colour ?? '',
      shop: listItem.shop ?? '',
      notes: listItem.notes ?? '',
    } as z.infer<typeof ListItemCreateSchema>,
    validators: { onChange: ListItemCreateSchema },
    onSubmit: async ({ value }) => {
      const res = await updateListItem(value)
      if (res.success) {
        toast.success('Gift Item Updated.')
        navigate({
          to: '/dashboard/$profileSlug/$listSlug',
          params: { profileSlug, listSlug: listSlug },
        })
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
            <Label htmlFor="itemImage">Update item image</Label>
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
        <div className="mt-auto">
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

      {/* Delete list */}
      <div className="flex flex-col space-y-4 border-t pb-8 pt-4">
        <Label className="text-md font-bold">Delete Item</Label>
        <p className="text-sm">
          Permanently delete this item.{' '}
          <strong>This action cannot be undone.</strong>
        </p>
        <div className="mt-2 flex justify-end">
          <Button
            variant="destructive"
            onClick={handleDeleteItem}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete item'}
          </Button>
        </div>
      </div>
    </div>
  )
}
