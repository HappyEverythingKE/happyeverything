import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { fallback } from '@tanstack/zod-adapter'

import { getVerifyOTP } from '@/services/auth.api'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

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

  useEffect(() => {
    const verifyMagicLink = async () => {
      const res = await getVerifyOTP(token_hash, type)

      if (res.success) {
        toast.success('Login successful!')
        navigate({ to: '/dashboard' })
        return null
      } else {
        toast.error('Magic link failed', { description: res.error })
        navigate({ to: '/signup' })
      }
    }

    verifyMagicLink()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Verifying magic link...</p>
      </div>
    </div>
  )
}
