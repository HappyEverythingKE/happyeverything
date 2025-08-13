import { useForm } from '@tanstack/react-form'

import { useCreateList } from '@/services/list.api'
import { ListCreateSchema } from '@shared/types'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ListTypeInput } from '@/components/ui/list-type-input'
import { Textarea } from '@/components/ui/textarea'
import { FieldInfo } from '@/components/field-info'

interface NewListFormProps {
  profileSlug: string
  onFormSubmit: () => void
  onFormCancel: () => void
}

const defaultValues = {
  name: '',
  description: '',
  listType: '',
} as z.infer<typeof ListCreateSchema>

export function NewListForm({
  profileSlug,
  onFormSubmit,
  onFormCancel,
}: NewListFormProps) {
  const { mutateAsync: createList, isPending } = useCreateList(profileSlug)

  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: ListCreateSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await createList(value)
        if (res.success) {
          toast.success('New list created successfully.')
          onFormSubmit()
        } else {
          toast.error('An error occurred', { description: res.error })
          form.setErrorMap({
            // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
            onSubmit: res.error || 'Unexpected error',
          })
        }
      } catch (error) {
        console.error('Error creating list:', error)
        toast.error('Failed to create list.')
      }
    },
  })

  return (
    <>
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
                    <Label htmlFor={field.name}>Give your list a name</Label>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={!field.state.meta.isValid}
                      placeholder="e.g. Nia's Baby Shower, My Birthday, Ramadhan Giving, etc."
                      maxLength={25}
                    />
                    <p className="-mt-1 text-xs text-gray-500">
                      {field.state.value.length}/25 characters
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-3">
            <form.Field
              name="description"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>
                      Add a short description (optional)
                    </Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Let people know what the list is for by adding your personal message."
                      rows={4}
                      className="min-h-[100px] w-full resize-none"
                      maxLength={100}
                    />
                    <p className="-mt-1 text-xs text-gray-500">
                      {field.state.value ? field.state.value.length : 0}/100
                      characters
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-3">
            <form.Field
              name="listType"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>Enter your list type</Label>
                    <ListTypeInput
                      inputValue={field.state.value}
                      onChange={field.handleChange}
                    />
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
    </>
  )
}
