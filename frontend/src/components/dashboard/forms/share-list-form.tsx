import { useForm } from '@tanstack/react-form'

import { useShareList, useUpdateListStatus } from '@/services/list.api'
import { ListShareSchema, type List } from '@shared/types'
import { ClipboardIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldInfo } from '@/components/field-info'

interface ShareListFormProps {
  profileSlug: string
  list: List
  onFormSubmit: () => void
  onFormCancel: () => void
}

export function ShareListForm({
  profileSlug,
  list,
  onFormSubmit,
  onFormCancel,
}: ShareListFormProps) {
  const shareableListLink = `${import.meta.env.VITE_APP_BASE_URL}/${profileSlug}/${list.slug}`

  // share list by setting privacy and password
  const { mutateAsync: shareList, isPending } = useShareList(
    profileSlug,
    list.slug,
  )
  // unpublish list
  const { mutateAsync: unpublishList, isPending: isUnpublishing } =
    useUpdateListStatus(profileSlug, list.slug)

  const handleListStatus = async () => {
    try {
      await unpublishList('draft')
      toast.success('List unpublished successfully.')
      onFormSubmit()
    } catch (error) {
      toast.error('An error occurred.', {
        description: String(error),
      })
    }
  }

  const form = useForm({
    defaultValues: {
      isPrivate: list.isPrivate,
      password: list.password || '',
    },
    onSubmit: async ({ value }) => {
      try {
        // Manually validating form data because of the boolean zod transformer
        const validatedData = ListShareSchema.parse(value)
        const res = await shareList(validatedData)
        if (res.success) {
          toast.success('List published successfully.')
          onFormSubmit()
        } else {
          toast.error('An error occurred.', { description: res.error })
          if (res.isFormError) {
            form.setErrorMap({
              // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
              onSubmit: res.error || 'Unexpected error',
            })
          }
        }
      } catch (error) {
        toast.error('An error occurred.', {
          description:
            error instanceof Error
              ? error.message
              : 'Please check your form inputs',
        })
      }
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <form.Field
              name="isPrivate"
              children={(field) => {
                return (
                  <>
                    <div className="flex flex-col space-y-1">
                      <Label className="text-md font-bold" htmlFor={field.name}>
                        List visibility
                      </Label>
                      <p className="text-sm text-gray-700">
                        Choose who can see this list
                      </p>
                    </div>
                    <RadioGroup
                      defaultValue={list.isPrivate ? 'true' : 'false'}
                      onValueChange={(value) =>
                        field.handleChange(value === 'true')
                      }
                      aria-invalid={!field.state.meta.isValid}
                    >
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem id="public" value="false" />
                          <Label htmlFor="public">Public</Label>
                        </div>
                        <p className="ml-7 text-sm text-gray-700">
                          Anyone with a link can see this list
                        </p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem id="private" value="true" />
                          <Label htmlFor="private">Private</Label>
                        </div>
                        <p className="ml-7 text-sm text-gray-700">
                          Only people with the password can see this list
                        </p>
                      </div>
                    </RadioGroup>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-4">
            <form.Field
              name="password"
              children={(field) => {
                return (
                  <>
                    <div className="flex flex-col space-y-1">
                      <Label
                        className="text-md font-semibold"
                        htmlFor={field.name}
                      >
                        Add a password for extra privacy
                      </Label>
                      <p className="text-sm text-gray-700">
                        This password will be used to access the private list
                      </p>
                    </div>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={!field.state.meta.isValid}
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
        <div>
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
                  {isPending ? 'Working...' : 'Publish'}
                </Button>
              </div>
            )}
          />
        </div>
      </form>

      {/* Shareable list link */}
      <div className="flex flex-col space-y-3 border-t pt-4">
        <Label className="text-md font-bold">Share your unique link</Label>
        <p className="text-center text-gray-700">{shareableListLink}</p>
      </div>
      <div className="-mt-1 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigator.clipboard.writeText(shareableListLink)}
        >
          <ClipboardIcon className="h-2 w-2" />
          Copy Link
        </Button>
      </div>

      {/* Unpublish list */}
      <div className="flex flex-col space-y-4 border-t pb-8 pt-4">
        <Label className="text-md font-bold">Unpublish List</Label>
        <p className="text-sm">
          When a list is unpublished, it is no longer accessible online but you
          can still see it in your dashboard. You can publish it at anytime.
        </p>
        <div className="mt-2 flex justify-end">
          <Button
            variant="destructive"
            onClick={handleListStatus}
            disabled={isUnpublishing || list.status === 'draft'}
          >
            {isUnpublishing ? 'Working...' : 'Unpublish'}
          </Button>
        </div>
      </div>
    </div>
  )
}
