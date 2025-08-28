import { useForm } from '@tanstack/react-form'

import { useCreateListItem } from '@/services/list-item.api'
import { ListItemCreateSchema } from '@shared/types'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  imageUrl: '',
  size: '',
  colour: '',
  productUrl: '',
  shopName: '',
} as z.infer<typeof ListItemCreateSchema>

export function NewListItemForm({
  profileSlug,
  listSlug,
  onFormSubmit,
  onFormCancel,
}: NewListItemFormProps) {
  const { mutateAsync: createListItem, isPending } = useCreateListItem(
    profileSlug,
    listSlug,
  )

  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: ListItemCreateSchema },
    onSubmit: async ({ value }) => {
      const res = await createListItem(value)
      if (res.success) {
        toast.success('New gift item added successfully.')
        onFormSubmit()
      } else {
        toast.error('An error occurred', { description: res.error })
        if (res.isFormError) {
          form.setErrorMap({
            // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
            onSubmit: res.error || 'Unexpected error',
          })
        }
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

          <div className="space-y-3 border-t pt-6">
            <p className="text-base font-semibold leading-none">Where to buy</p>
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
                    <p className="-mt-1 ml-1 text-xs text-gray-500">
                      {field.state.value?.length ?? 0}/50 characters
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
