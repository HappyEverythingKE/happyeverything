import { useForm } from '@tanstack/react-form'

import { useCreateProfile, useUpdateProfile } from '@/services/profile.api'
import { ProfileSlugSchema } from '@shared/types'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FieldInfo } from '@/components/field-info'

interface ProfileFormProps {
  mode: 'create' | 'update'
  currentSlug?: string
  defaultValues?: z.infer<typeof ProfileSlugSchema>
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function ProfileForm({
  mode,
  currentSlug,
  defaultValues = { slug: '' },
  trigger,
  onSuccess,
}: ProfileFormProps) {
  const { mutateAsync: createProfile, isPending: isCreating } =
    useCreateProfile()
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateProfile()

  const isLoading = isCreating || isUpdating

  const profileForm = useForm({
    defaultValues,
    validators: { onChange: ProfileSlugSchema },
    onSubmit: async ({ value }) => {
      try {
        let res
        if (mode === 'create') {
          res = await createProfile(value.slug)
        } else {
          if (!currentSlug) {
            throw new Error('Current slug is required for update mode')
          }
          res = await updateProfile({ currentSlug, newSlug: value.slug })
        }

        if (res.success) {
          toast.success(
            mode === 'create' ? 'Profile Created.' : 'Profile Updated.',
          )
          onSuccess?.()
        } else {
          toast.error('An error occurred', { description: res.error })
          profileForm.setErrorMap({
            // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
            onSubmit: res.error || 'Unexpected error',
          })
        }
      } catch (error) {
        toast.error(`Failed to ${mode} profile.`)
        console.error(`Error ${mode}ing profile:`, error)
      }
    },
  })

  const title = mode === 'create' ? 'Create a new profile' : 'Edit your profile'
  const description =
    mode === 'create'
      ? 'Your username is used to make your shareable link unique.'
      : 'Your username is used to make your shareable link unique.'

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            profileForm.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <profileForm.Field
            name="slug"
            children={(field) => {
              return (
                <>
                  <div className="relative overflow-hidden">
                    <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                      @
                    </span>
                    <Input
                      id={field.name}
                      type="text"
                      value={field.state.value as string}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={!field.state.meta.isValid}
                      className="pl-7"
                      maxLength={20}
                      placeholder="Enter username"
                    />
                  </div>
                  <FieldInfo field={field} />
                </>
              )
            }}
          />

          {/* URL preview */}
          <profileForm.Subscribe
            selector={(state) => [state.values.slug]}
            children={([slugValue]) => (
              <div className="wrap-anywhere text-sm text-gray-500">
                happyeverything.com/{slugValue || ''}
              </div>
            )}
          />

          <profileForm.Subscribe
            selector={(state) => [state.errorMap]}
            children={([errorMap]) =>
              errorMap.onSubmit ? (
                <p className="text-destructive text-center text-sm font-medium">
                  {errorMap.onSubmit}
                </p>
              ) : null
            }
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {/* Form submission */}
            <profileForm.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.isPristine,
              ]}
              children={([canSubmit, isSubmitting, isPristine]) => (
                <Button
                  type="submit"
                  disabled={
                    !canSubmit || isPristine || isSubmitting || isLoading
                  }
                >
                  {isSubmitting || isLoading
                    ? 'Working...'
                    : mode === 'create'
                      ? 'Create'
                      : 'Update'}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
