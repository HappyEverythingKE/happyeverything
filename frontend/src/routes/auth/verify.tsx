import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { fallback } from '@tanstack/zod-adapter'

import { getVerifyOTP, postResendConfirmationEmail } from '@/services/auth.api'
import { EmailSchema } from '@shared/types'
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

const OtpSearchSchema = z.object({
  next: fallback(z.string(), '').default(''),
  resend: fallback(z.string(), '').default(''),
  token_hash: fallback(z.string(), '').default(''),
  type: fallback(z.string(), '').default(''),
})

export const Route = createFileRoute('/auth/verify')({
  validateSearch: OtpSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { next, resend, token_hash, type } = Route.useSearch()

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'error' | 'success'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showResend, setShowResend] = useState<boolean>(false)
  const hasRunRef = useRef(false)

  const handleVerify = async () => {
    if (hasRunRef.current) return
    hasRunRef.current = true

    setStatus('loading')
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      await getVerifyOTP(token_hash, type)

      await queryClient.invalidateQueries()
      await router.invalidate()

      setStatus('success')
      // Normalize "next" to an app-relative path and prevent malformed URLs
      const resolveNext = (raw: string | undefined) => {
        if (!raw) return '/dashboard'
        try {
          const decoded = decodeURIComponent(raw)
          // App-relative path
          if (decoded.startsWith('/')) return decoded
          // Absolute or scheme-like string → coerce to URL and validate origin
          const url = new URL(decoded, window.location.origin)
          if (url.origin === window.location.origin) {
            return `${url.pathname}${url.search}`
          }
          // External origin not allowed for in-app navigate
          return '/dashboard'
        } catch {
          return '/dashboard'
        }
      }

      const safeNext = resolveNext(next)
      navigate({ to: safeNext, replace: true })
    } catch (error) {
      const message = (error as Error).message
      setStatus('error')
      setErrorMessage(message)
      toast.error('Verification failed')
    }
  }

  const form = useForm({
    defaultValues: { email: resend || '' },
    validators: { onChange: EmailSchema },
    onSubmit: async ({ value }) => {
      try {
        setSuccessMessage(null)
        setErrorMessage(null)
        await postResendConfirmationEmail(value.email)
        setSuccessMessage(
          'Check your email inbox (or spam folder) for a new confirmation link.',
        )
        form.reset()
      } catch (error) {
        setStatus('error')
        setSuccessMessage(null)
        form.setErrorMap({
          // @ts-expect-error onSubmit expects a map
          onSubmit: (error as Error).message,
        })
        toast.error('An unexpected error occurred')
      }
    },
  })

  useEffect(() => {
    handleVerify()
  }, [])

  return (
    <Card className="mx-4 w-full max-w-md gap-2 md:px-2 md:py-8">
      <CardHeader className="space-y-4">
        <CardTitle className="text-center text-lg">Almost there!</CardTitle>
        <CardDescription className="text-balance text-center text-base">
          Give us a moment while we verify your email.
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex flex-col items-center">
        {status === 'loading' && <Spinner>Verifying your email...</Spinner>}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 text-center text-sm">
            {errorMessage && (
              <div className="border-destructive/50 rounded-md border bg-red-50 p-3 md:p-4">
                <p className="overflow-auto text-clip text-pretty text-sm font-medium text-red-800">
                  {errorMessage}
                </p>
              </div>
            )}
            {successMessage && (
              <div className="rounded-md border border-green-800/50 bg-green-50 p-3 md:p-4">
                <p className="overflow-auto text-clip text-pretty text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            )}

            <Collapsible open={showResend} onOpenChange={setShowResend}>
              <CollapsibleTrigger
                asChild
                className="flex w-full justify-center"
              >
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
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              aria-invalid={!field.state.meta.isValid}
                            />
                            <form.Subscribe
                              selector={(state) => [
                                state.canSubmit,
                                state.isSubmitting,
                                state.isPristine,
                              ]}
                              children={([
                                canSubmit,
                                isSubmitting,
                                isPristine,
                              ]) => (
                                <Button
                                  type="submit"
                                  variant="secondary"
                                  disabled={
                                    !canSubmit || isPristine || isSubmitting
                                  }
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
                          <div className="border-destructive/50 rounded-md border bg-red-50 p-3 md:p-4">
                            <p className="overflow-auto text-clip text-pretty text-sm font-medium text-red-800">
                              {errorMap.onSubmit}
                            </p>
                          </div>
                        ) : null
                      }
                    />
                  </form>
                </CardFooter>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
