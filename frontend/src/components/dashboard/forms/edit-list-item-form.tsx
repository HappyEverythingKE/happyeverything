import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { useDeleteListItem, useUpdateListItem } from '@/services/list-item.api'
import { ListItemCreateSchema, type ListItem } from '@shared/types'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  // update list item
  const { mutateAsync: updateListItem, isPending } = useUpdateListItem(
    profileSlug,
    listSlug,
    listItem.id,
  )
  // delete list item
  const { mutateAsync: deleteListItem, isPending: isDeleting } =
    useDeleteListItem(profileSlug, listSlug, listItem.id)

  const handleDeleteItem = async () => {
    try {
      await deleteListItem()
      toast.success('Your item has been deleted.')
      navigate({
        to: '/dashboard/$profileSlug/$listSlug',
        params: { profileSlug, listSlug: listSlug },
      })
      onFormCancel()
    } catch (error) {
      toast.error('Failed to delete item.', { description: String(error) })
    }
  }

  const form = useForm({
    defaultValues: {
      name: listItem.name,
      quantity: listItem.quantity,
      topPick: listItem.topPick,
      imageUrl: listItem.imageUrl ?? '',
      size: listItem.size ?? '',
      colour: listItem.colour ?? '',
      productUrl: listItem.productUrl ?? '',
      shopName: listItem.shopName ?? '',
    } as z.infer<typeof ListItemCreateSchema>,
    validators: { onChange: ListItemCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await updateListItem(value)
        if (res.success) {
          toast.success('Your item has been updated successfully.')
          navigate({
            to: '/dashboard/$profileSlug/$listSlug',
            params: { profileSlug, listSlug: listSlug },
          })
          onFormSubmit()
        } else {
          toast.error('An error occurred', { description: res.error })
          form.setErrorMap({
            // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
            onSubmit: res.error || 'Unexpected error',
          })
        }
      } catch (error) {
        toast.error('Error updating item.', { description: String(error) })
      }
    },
  })

  return (
    <div className="flex h-full flex-col gap-12 md:grid md:grid-rows-[auto_1fr]">
      <form
        className="flex h-full flex-col gap-6 md:grid md:grid-rows-[auto_1fr]"
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
                    <Label htmlFor={field.name}>What is the item?</Label>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={!field.state.meta.isValid}
                      placeholder="For example: wireless headphones)"
                      maxLength={50}
                    />
                    <p className="-mt-1 ml-1 text-xs text-gray-500">
                      {field.state.value.length}/50 characters
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
                    <Label htmlFor={field.name}>Quantity</Label>
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
              name="imageUrl"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>Add an image URL</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Paste a link to an image of the gift"
                      aria-invalid={!field.state.meta.isValid}
                    />
                    <p className="-mt-1 ml-1 text-xs text-gray-500">
                      Tip: On desktop, find an image of your gift. Right-click
                      the image and choose “Copy Image Address.” On mobile,
                      long-press the image to copy the link.
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
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
                      Tip: If the item has no size, you can leave this blank.
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
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold leading-none">Where to buy</p>
            <p className="-mt-1 text-xs text-gray-500">
              Add a website link or shop name to help others find it easily.
            </p>
          </div>

          <div className="space-y-3">
            <form.Field
              name="productUrl"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>Product link</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Paste a URL (e.g. https://www.shop.com/item)"
                      aria-invalid={!field.state.meta.isValid}
                    />
                    <p className="-mt-1 text-xs text-gray-500">
                      Tip: If the item is available online, you can paste the
                      link here. If not, you can leave this blank.
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-3">
            <form.Field
              name="shopName"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>Shop name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Carrefour"
                      aria-invalid={!field.state.meta.isValid}
                      maxLength={50}
                    />
                    <p className="-mt-1 text-xs text-gray-500">
                      Tip: If the item is available online, you can paste the
                      link here. If not, you can leave this blank.
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-3">
            <form.Field
              name="topPick"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>
                      Is this a top pick for you?
                    </Label>
                    <Select
                      value={field.state.value ? 'true' : 'false'}
                      onValueChange={(value) =>
                        field.handleChange(value === 'true')
                      }
                    >
                      <SelectTrigger
                        id={field.name}
                        onBlur={field.handleBlur}
                        className="w-full"
                      >
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="-mt-1 text-xs text-gray-500">
                      Tip: If the item is a top pick for you, you can select
                      &quot;Yes&quot; and it will be highlighted in the list.
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
                <p className="text-destructive text-sm font-medium">
                  {errorMap.onSubmit}
                </p>
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
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </Button>
        </div>
      </div>
    </div>
  )
}
