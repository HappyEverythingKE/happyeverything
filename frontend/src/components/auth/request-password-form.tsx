import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { EmailSchema } from '@shared/types'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'

import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { FieldInfo } from '@/components/field-info'

const defaultValues = {
  email: '',
} as z.infer<typeof EmailSchema>

export function RequestPasswordForm({
  setResetPassword,
}: {
  setResetPassword: (resetPassword: boolean) => void
}) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const requestPasswordForm = useForm({
    defaultValues: defaultValues,
    validators: { onChange: EmailSchema },
    onSubmit: async ({ value }) => {
      setSuccessMessage(null)
      try {
        const nextPath = '/auth/new-password'
        const redirectTo = `${window.location.origin}${nextPath}`
        await supabase.auth.resetPasswordForEmail(value.email, { redirectTo })
        setSuccessMessage(
          'If this email is associated with an account, you will receive a password reset link.',
        )
      } catch (error) {
        setSuccessMessage(null)
        console.error(error)
        requestPasswordForm.setErrorMap({
          // @ts-expect-error tanstack form expects a field map
          onSubmit: 'An unexpected error occurred',
        })
      }
    },
  })

  return (
    <>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          requestPasswordForm.handleSubmit()
        }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-pretty text-2xl md:pb-2">Reset your password</h1>
          <p className="text-balance">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <requestPasswordForm.Field
              name="email"
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="me@example.com"
                    autoComplete="username"
                    aria-invalid={!field.state.meta.isValid}
                  />
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          <requestPasswordForm.Subscribe
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

          <requestPasswordForm.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.isPristine,
            ]}
            children={([canSubmit, isSubmitting, isPristine]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isPristine || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Sending...
                  </span>
                ) : (
                  'Send password reset link'
                )}
              </Button>
            )}
          />
        </div>
      </form>

      {successMessage && (
        <div className="mt-6 rounded-md border border-green-100 bg-green-100 p-3 text-center md:p-4">
          <p className="text-pretty text-sm font-medium text-green-800">
            {successMessage}
          </p>
        </div>
      )}

      <div className="mt-6 text-center text-sm">
        <Button
          variant="link"
          className="p-0"
          onClick={() => {
            setResetPassword(false)
          }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Button>
      </div>
    </>
  )
}
