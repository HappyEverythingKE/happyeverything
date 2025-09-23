import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { useCreateProfile } from '@/services/profile.api'
import { ProfileSlugSchema } from '@shared/types'
import { ArrowLeftIcon } from 'lucide-react'
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
  slug: '',
} as z.infer<typeof ProfileSlugSchema>

export function ProfileSlugForm() {
  const navigate = useNavigate()
  const { mutateAsync: createProfile } = useCreateProfile()

  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: ProfileSlugSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await createProfile(value.slug)
        if (res.success) {
          navigate({
            to: '/dashboard/$profileSlug',
            params: { profileSlug: res.data.slug },
          })
        } else {
          toast.error('An error occurred', { description: res.error })
          form.setErrorMap({
            // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
            onSubmit: res.error || 'Unexpected error',
          })
        }
      } catch (error) {
        console.error('Error creating profile:', error)
        toast.error('Failed to create profile.')
      }
    },
  })

  return (
    <Card className="flex max-w-[90vw] flex-1 md:w-full md:max-w-lg">
      <CardHeader className="gap-3">
        <CardTitle className="text-lg">Claim your username</CardTitle>
        <CardDescription className="text-balance text-base">
          Your username will be used to make your shareable link unique.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
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
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={!field.state.meta.isValid}
                      className="pl-7"
                      maxLength={20}
                    />
                  </div>
                  <FieldInfo field={field} />
                </>
              )
            }}
          />

          {/* URL preview */}
          <form.Subscribe
            selector={(state) => [state.values.slug]}
            children={([slugValue]) => (
              <div className="wrap-anywhere text-center text-sm text-gray-500">
                happyeverything.com/{slugValue || ''}
              </div>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.errorMap]}
            children={([errorMap]) =>
              errorMap.onSubmit ? (
                <p className="text-destructive text-center text-sm font-medium">
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
                className="mt-2 w-full"
              >
                {isSubmitting ? 'Working...' : 'Claim'}
              </Button>
            )}
          />
        </form>
        <div className="mt-3 flex flex-col">
          <Button asChild variant="link" className="p-0 text-xs text-gray-500">
            <div className="flex items-center gap-0">
              <ArrowLeftIcon className="h-4 w-4" />
              <Link to="/dashboard">Return to dashboard</Link>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
