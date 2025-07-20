import { useEffect, useRef, useState } from 'react'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useRouter,
} from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { fallback } from '@tanstack/zod-adapter'

import { getUserProfileStatus, getVerifyOTP } from '@/services/auth.api'
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
import { LogoHeader } from '@/components/layout/logo-header'

const OtpSearchSchema = z.object({
  token_hash: fallback(z.string(), '').default(''),
  type: fallback(z.string(), '').default(''),
})

export const Route = createFileRoute('/auth-confirm')({
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
  const { token_hash, type } = Route.useSearch()

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
      const { hasProfile } = await getUserProfileStatus()
      setStatus('success')
      navigate({ to: hasProfile ? '/dashboard' : '/onboarding' })
    } catch (error) {
      const message = (error as Error).message
      setStatus('error')
      setErrorMessage(message)
      toast.error('Verification failed', { description: message })
    }
  }

  useEffect(() => {
    handleVerify()
  }, [])

  return (
    <>
      <LogoHeader />
      <div className="mx-auto flex w-full flex-1 items-center justify-center">
        <Card className="md:px-2 md:py-8">
          <CardHeader className="gap-3">
            <CardTitle className="text-lg">Almost there!</CardTitle>
            <CardDescription className="text-balance text-base">
              Click below to finish logging in.
            </CardDescription>
          </CardHeader>

          <CardFooter className="w-full flex-col items-start gap-4">
            {status === 'loading' && (
              <Button disabled className="w-full">
                Verifying your magic link...
              </Button>
            )}

            {(status === 'error' || status === 'idle') && (
              <Button className="w-full" onClick={handleVerify}>
                Confirm
              </Button>
            )}

            {status === 'error' && (
              <div className="text-muted-foreground text-sm">
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                <p>
                  Having trouble?{' '}
                  <Button asChild variant="link" className="p-0">
                    <Link to="/login">Resend magic link.</Link>
                  </Button>
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
