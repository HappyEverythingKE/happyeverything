import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { postResendConfirmationEmail } from '@/services/auth.api'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { FieldInfo } from '@/components/field-info'

export const Route = createFileRoute('/auth/confirm-email')({
  component: RouteComponent,
})

const EmailSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
})

function RouteComponent() {
  const [showResend, setShowResend] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { email: '' },
    validators: { onChange: EmailSchema },
    onSubmit: async ({ value }) => {
      try {
        setSuccessMessage(null)
        await postResendConfirmationEmail(value.email)
        setSuccessMessage(
          'Check your email inbox (or spam folder) for a new confirmation link.',
        )
        form.reset()
      } catch (error) {
        setSuccessMessage(null)
        form.setErrorMap({
          // @ts-expect-error onSubmit expects a map
          onSubmit: (error as Error).message,
        })
        toast.error('An unexpected error occurred')
      }
    },
  })

  return (
    <Card className="mx-4 w-full max-w-md md:px-2 md:py-8">
      <CardHeader>
        <CardTitle className="text-center text-lg">
          Confirm your email
        </CardTitle>
        <CardDescription className="text-balance text-center text-base">
          Please check your email for a confirmation link and complete your sign
          up.
        </CardDescription>
      </CardHeader>

      <Collapsible open={showResend} onOpenChange={setShowResend}>
        <CollapsibleTrigger asChild className="flex w-full justify-center">
          <Button variant="link" size="sm" className="mx-auto w-fit">
            {showResend ? 'Hide' : "Didn't receive the email?"}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
          <CardFooter className="text-muted-foreground flex flex-col items-center justify-center gap-4 text-sm">
            <p className="text-balance text-center">
              Enter the same email you used to sign up.
            </p>
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
            >
              <form.Field
                name="email"
                children={(field) => (
                  <>
                    <div className="flex w-full flex-col gap-2 md:flex-row">
                      <Input
                        id={field.name}
                        type="email"
                        placeholder="Enter your email"
                        value={(field.state.value as string) || ''}
                        autoComplete="username"
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={!field.state.meta.isValid}
                      />
                      <form.Subscribe
                        selector={(state) => [
                          state.canSubmit,
                          state.isSubmitting,
                          state.isPristine,
                        ]}
                        children={([canSubmit, isSubmitting, isPristine]) => (
                          <Button
                            type="submit"
                            variant="secondary"
                            disabled={!canSubmit || isPristine || isSubmitting}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center gap-2">
                                <Spinner /> Sending...
                              </span>
                            ) : (
                              'Resend'
                            )}
                          </Button>
                        )}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </>
                )}
              />

              <form.Subscribe
                selector={(state) => [state.errorMap]}
                children={([errorMap]) =>
                  errorMap.onSubmit ? (
                    <div className="rounded-md border border-red-100 bg-red-100 p-3 text-center md:p-4">
                      <p className="text-pretty text-sm font-medium text-red-800">
                        {errorMap.onSubmit}
                      </p>
                    </div>
                  ) : null
                }
              />
            </form>

            <div className="flex items-center">
              {successMessage && (
                <div className="rounded-md border border-green-100 bg-green-100 p-3 text-center md:p-4">
                  <p className="text-pretty text-sm font-medium text-green-800">
                    {successMessage ||
                      'Check your email inbox (or spam folder) for a new confirmation link.'}
                  </p>
                </div>
              )}
            </div>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
