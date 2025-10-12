import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'

import {
  listTypesQueryOptions,
  useDeleteList,
  useUpdateList,
  useUpdateListStatus,
} from '@/services/list.api'
import { ListCreateSchema, ListStatusType, type List } from '@shared/types'
import { startCase } from 'lodash'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
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
  const [showDeleteListDialog, setShowDeleteListDialog] = useState(false)
  const [deleteListConfirmation, setDeleteListConfirmation] = useState('')
  const navigate = useNavigate()
  // get list types
  const {
    data: listTypes,
    isLoading: isListTypesLoading,
    error: listTypesError,
  } = useQuery(listTypesQueryOptions())
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

  const handleListStatus = async (status: ListStatusType) => {
    try {
      await updateStatus(status)
      toast.success('List Status Updated.')
      onFormSubmit()
    } catch (error) {
      toast.error('An error occurred.', {
        description: String(error),
      })
    }
  }

  const handleDeleteListClick = () => {
    setShowDeleteListDialog(true)
    setDeleteListConfirmation('')
  }

  const handleCancelDeleteList = () => {
    setShowDeleteListDialog(false)
    setDeleteListConfirmation('')
  }

  const handleConfirmDeleteList = () => {
    if (deleteListConfirmation === 'DELETE') {
      setShowDeleteListDialog(false)
      handleDeleteList()
    }
  }

  const handleDeleteList = async () => {
    try {
      await deleteList()
      toast.success('List Deleted.')
      navigate({
        to: '/dashboard/$profileSlug',
        params: { profileSlug },
      })
      onFormCancel()
    } catch (error) {
      toast.error('An error occurred.', { description: String(error) })
    }
  }

  const form = useForm({
    defaultValues: {
      name: list.name,
      description: list.description,
      listTypeId: list.listType.id,
    } as z.infer<typeof ListCreateSchema>,
    validators: { onChange: ListCreateSchema },
    onSubmit: async ({ value }) => {
      const res = await updateList(value)
      if (res.success) {
        toast.success('List Updated.')
        navigate({
          to: '/dashboard/$profileSlug/$listSlug',
          params: { profileSlug, listSlug: res.data.slug },
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
            {listTypesError && (
              <p className="text-destructive text-sm font-medium">
                {listTypesError.message}
                Trouble loading list types. Please try again later.
              </p>
            )}
            <form.Field
              name="listTypeId"
              children={(field) => {
                return (
                  <>
                    <Label htmlFor={field.name}>Select a list type</Label>
                    <Combobox
                      fieldId={field.name}
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      aria-invalid={!field.state.meta.isValid}
                      placeholder="Birthday, etc."
                      searchPlaceholder="Search list types..."
                      emptyMessage="No list type found."
                      disabled={isListTypesLoading}
                      options={
                        isListTypesLoading
                          ? [{ value: 'loading', label: 'Loading...' }]
                          : listTypes?.map((type) => ({
                              value: type.id,
                              label: startCase(type.name),
                            })) || []
                      }
                    />
                    <p className="-mt-1 text-xs text-gray-500">
                      Reach out to us if you don&apos;t see the list type
                      you&apos;re looking for.
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
                list.status === 'archived' ? 'draft' : 'archived',
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
            onClick={handleDeleteListClick}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete list'}
          </Button>
        </div>
      </div>

      {/* Delete List Confirmation Dialog */}
      <Dialog
        open={showDeleteListDialog}
        onOpenChange={setShowDeleteListDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription className="text-pretty">
              This action cannot be undone. This will permanently delete this
              list and remove all of its items from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="delete-confirmation" className="block">
                To confirm, type <strong>DELETE</strong> in the box below:
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteListConfirmation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDeleteListConfirmation(e.target.value)
                }
                placeholder="Type DELETE to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDeleteList}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteList}
              disabled={deleteListConfirmation !== 'DELETE' || isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Deleting...
                </span>
              ) : (
                'Delete list'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
