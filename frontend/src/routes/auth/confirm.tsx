import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { fallback } from '@tanstack/zod-adapter'

import { getVerifyOTP } from '@/services/auth.api'
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

export const Route = createFileRoute('/auth/confirm')({
  validateSearch: OtpSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { token_hash, type } = Route.useSearch()

  const handleVerify = async () => {
    const res = await getVerifyOTP(token_hash, type)

    if (res.success) {
      navigate({ to: '/dashboard' })
    } else {
      toast.error('Verification failed', { description: res.error })
      navigate({ to: '/signup' })
    }
  }

  return (
    <>
      <LogoHeader />
      <div className="mx-auto flex w-full flex-1 items-center justify-center">
        <Card className="md:px-4 md:py-8">
          <CardHeader className="gap-3">
            <CardTitle className="text-lg">Confirm Your Email</CardTitle>
            <CardDescription className="text-balance text-base">
              Click below to finish logging in.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-4">
            <Button className="w-full" onClick={handleVerify}>
              Confirm
            </Button>
            <div className="text-sm">
              Having trouble?{' '}
              <Button asChild variant="link" className="p-0">
                <Link to="/login">Resend magic link.</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
