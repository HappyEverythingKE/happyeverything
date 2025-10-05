import { useEffect, useRef, useState } from 'react'
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { fallback } from '@tanstack/zod-adapter'

import { getVerifyOTP, postResendConfirmationEmail } from '@/services/auth.api'
import { allProfilesQueryOptions } from '@/services/profile.api'
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
  resend: fallback(z.string(), '').default(''),
  token_hash: fallback(z.string(), '').default(''),
  type: fallback(z.string(), '').default(''),
})

export const Route = createFileRoute('/auth/auth-verify')({
  validateSearch: OtpSearchSchema,
  beforeLoad: async ({ context }) => {
    if (context.authState.isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { resend, token_hash, type } = Route.useSearch()

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'error' | 'success'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasRunRef = useRef(false)

  const handleVerify = async () => {
    if (hasRunRef.current) return
    hasRunRef.current = true

    setStatus('loading')
    setErrorMessage(null)

    try {
      await getVerifyOTP(token_hash, type)

      await queryClient.invalidateQueries()
      await router.invalidate()

      // navigate user based on profile status
      const profiles = await queryClient.ensureQueryData(
        allProfilesQueryOptions,
      )

      setStatus('success')

      if (!profiles || profiles.length === 0) {
        navigate({ to: '/onboarding' })
      } else {
        navigate({ to: '/dashboard' })
      }
    } catch (error) {
      const message = (error as Error).message
      setStatus('error')
      setErrorMessage(message)
      toast.error('Verification failed')
    }
  }

  const resendConfirmationEmail = async () => {
    try {
      await postResendConfirmationEmail(resend)
      toast.success('Check your email for a new confirmation link.')
    } catch (error) {
      const message = (error as Error).message
      setStatus('error')
      setErrorMessage(message)
      toast.error('Resend confirmation email failed')
    }
  }

  useEffect(() => {
    handleVerify()
  }, [])

  return (
    <Card className="mx-4 w-full max-w-md md:px-2 md:py-8">
      <CardHeader className="space-y-4">
        <CardTitle className="text-center text-lg">Almost there!</CardTitle>
        <CardDescription className="text-balance text-center text-base">
          Give us a moment while we verify your email.
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex flex-col items-center">
        {status === 'loading' && <Spinner>Verifying your email...</Spinner>}

        {status === 'error' && (
          <div className="text-muted-foreground flex flex-col items-center text-sm">
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
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
