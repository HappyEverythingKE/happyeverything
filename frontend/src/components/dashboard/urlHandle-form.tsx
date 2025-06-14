import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { UrlHandleSchema } from '@shared/types'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FieldInfo } from '@/components/field-info'

const defaultValues = {
  urlHandle: '',
} as z.infer<typeof UrlHandleSchema>

export function URLHandleForm() {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: UrlHandleSchema },
    onSubmit: async ({ value }) => {
      console.log(value)
      const res = await postClaimUrlHandle(value.urlHandle)
      if (res.success) {
        navigate({ to: '/dashboard' })
      } else {
        toast.error('An error occured', { description: res.error })
        form.setErrorMap({
          // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
          onSubmit: res.error || 'Unexpected error',
        })
      }
    },
  })

  return (
    <div className="mx-auto flex w-full flex-1 items-center justify-center">
      <Card className="md:px-4 md:py-8">
        <CardHeader className="gap-3">
          <CardTitle className="text-lg">Claim your username</CardTitle>
          <CardDescription className="text-balance text-base">
            Your username will be used to make your shareable link unique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <div className="">
              <form.Field
                name="urlHandle"
                children={(field) => {
                  return (
                    <>
                      <Input
                        id={field.name}
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={!field.state.meta.isValid}
                        placeholder="@"
                      />
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
            </div>
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

            {/* Form submission */}
            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.isPristine,
              ]}
              children={([canSubmit, isSubmitting, isPristine]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isPristine || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Working...' : 'Claim'}
                </Button>
              )}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
