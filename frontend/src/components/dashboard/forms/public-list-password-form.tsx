import { useForm } from '@tanstack/react-form'

import { useCheckPublicListPassword } from '@/services/public.api'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldInfo } from '@/components/field-info'

interface PublicListPasswordFormProps {
  profileSlug: string
  listSlug: string
}

export function PublicListPasswordForm({
  profileSlug,
  listSlug,
}: PublicListPasswordFormProps) {
  const { mutateAsync: checkPassword, isPending } = useCheckPublicListPassword(
    profileSlug,
    listSlug,
  )

  const form = useForm({
    defaultValues: {
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await checkPassword(value.password)
        toast.success('List Unlocked!')
      } catch (error) {
        form.setErrorMap({
          // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
          onSubmit:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        })
      }
    },
  })

  return (
    <form
      className="flex flex-col items-center justify-center gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="grid grid-cols-1 place-items-center gap-4 md:grid-cols-[2fr_0.55fr] md:gap-0">
        <div className="space-y-3">
          <form.Field
            name="password"
            children={(field) => {
              return (
                <>
                  <Input
                    type="password"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={!field.state.meta.isValid}
                    placeholder="Enter password"
                  />
                  <FieldInfo field={field} />
                </>
              )
            }}
          />

          {/* Error alerts */}
          <form.Subscribe
            selector={(state) => [state.errorMap]}
            children={([errorMap]) =>
              errorMap.onSubmit ? (
                <div className="border-destructive/50 rounded-md border bg-red-50 p-3 md:p-4">
                  <p className="overflow-auto text-clip text-pretty text-sm font-medium text-red-800">
                    {errorMap.onSubmit}
                  </p>
                </div>
              ) : null
            }
          />
        </div>
        {/* Form submission */}
        <div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || isPending}
              >
                {isPending ? 'Working...' : 'Unlock List'}
              </Button>
            )}
          />
        </div>
      </div>
    </form>
  )
}
