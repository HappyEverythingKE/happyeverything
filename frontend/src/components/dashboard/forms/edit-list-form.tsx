import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import {
  useDeleteList,
  useUpdateList,
  useUpdateListStatus,
} from '@/services/list.api'
import { ListUpdateSchema, StatusType, type List } from '@shared/types'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ListTypeInput } from '@/components/ui/list-type-input'
import { Textarea } from '@/components/ui/textarea'
import { FieldInfo } from '@/components/field-info'

interface EditListFormProps {
  profileSlug: string
  list: List
  onFormSubmit: () => void
  onFormCancel: () => void
}

export function EditListForm({
  profileSlug,
  list,
  onFormSubmit,
  onFormCancel,
}: EditListFormProps) {
  const navigate = useNavigate()
  // update list
  const { mutateAsync: updateList, isPending } = useUpdateList(
    profileSlug,
    list.slug,
  )
  // update list status
  const { mutateAsync: updateStatus, isPending: isArchiving } =
    useUpdateListStatus(profileSlug, list.slug)
  // delete list
  const { mutateAsync: deleteList, isPending: isDeleting } = useDeleteList(
    profileSlug,
    list.slug,
  )

  const handleListStatus = async (status: StatusType) => {
    try {
      await updateStatus(status)
      toast.success('Your list has been updated successfully.')
      onFormSubmit()
    } catch (error) {
      console.error('Error archiving list:', error)
      toast.error('Failed to update the list status.')
    }
  }

  const handleDeleteList = async () => {
    try {
      await deleteList()
      toast.success('Your list has been deleted.')
      navigate({
        to: '/dashboard/$profileSlug',
        params: { profileSlug },
      })
      onFormCancel()
    } catch (error) {
      console.error('Error deleting list:', error)
    }
  }

  const form = useForm({
    defaultValues: {
      name: list.name,
      description: list.description,
      listType: list.listType,
    } as z.infer<typeof ListUpdateSchema>,
    validators: { onChange: ListUpdateSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await updateList(value)
        if (res.success) {
          toast.success('Your list has been updated successfully.')
          navigate({
            to: '/dashboard/$profileSlug/$listSlug',
            params: { profileSlug, listSlug: res.data.slug },
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
        toast.error('Failed to update list.', { description: String(error) })
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

      {/* Archive list */}
      <div className="flex flex-col space-y-4 border-t pt-4">
        <Label className="text-md font-bold">Archive List</Label>
        <p className="text-sm">
          When a list is archived, it is no longer accessible online but you can
          still see it in your dashboard. You can unarchive it at anytime.
        </p>
        <div className="mt-2 flex justify-end">
          <Button
            variant="secondary"
            onClick={() =>
              handleListStatus(
                list.status === 'archived' ? 'active' : 'archived',
              )
            }
            disabled={isArchiving}
          >
            {list.status === 'archived' ? 'Restore' : 'Archive'}
          </Button>
        </div>
      </div>

      {/* Delete list */}
      <div className="flex flex-col space-y-4 border-t pb-8 pt-4">
        <Label className="text-md font-bold">Delete List</Label>
        <p className="text-sm">
          Permanently remove this list and all its items.
          <br />
          <strong>This action cannot be undone.</strong>
        </p>
        <div className="mt-2 flex justify-end">
          <Button
            variant="destructive"
            onClick={handleDeleteList}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete List'}
          </Button>
        </div>
      </div>
    </div>
  )
}
