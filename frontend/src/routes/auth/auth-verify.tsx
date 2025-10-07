import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { fallback } from '@tanstack/zod-adapter'

import { getVerifyOTP, postResendConfirmationEmail } from '@/services/auth.api'
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
import { Spinner } from '@/components/ui/spinner'

const OtpSearchSchema = z.object({
  next: fallback(z.string(), '').default(''),
  resend: fallback(z.string(), '').default(''),
  token_hash: fallback(z.string(), '').default(''),
  type: fallback(z.string(), '').default(''),
})

export const Route = createFileRoute('/auth/auth-verify')({
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

  const resendConfirmationEmail = async () => {
    setSuccessMessage(null)

    try {
      await postResendConfirmationEmail(resend)
      toast.success('Resent confirmation email!', {
        description: 'Check your inbox for a new confirmation link.',
      })
      setSuccessMessage(
        'Check your email inbox (or spam folder) for a new confirmation link.',
      )
    } catch (error) {
      const message = (error as Error).message
      setStatus('error')
      setSuccessMessage(null)
      setErrorMessage(message)
      toast.error('Failed to resend confirmation email')
    }
  }

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
          <div className="flex flex-col items-center text-sm">
            {errorMessage && (
              <div className="rounded-md bg-red-50 p-2 text-center">
                <p className="text-red-800">{errorMessage}</p>
              </div>
            )}
            {successMessage && (
              <div className="rounded-md bg-green-50 p-2 text-center">
                <p className="text-green-800">{successMessage}</p>
              </div>
            )}
            <p>
              Having trouble?{' '}
              <Button
                variant="link"
                className="p-0"
                onClick={resendConfirmationEmail}
              >
                Resend confirmation email.
              </Button>
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
