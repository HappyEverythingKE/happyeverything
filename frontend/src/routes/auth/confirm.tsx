import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { fallback } from '@tanstack/zod-adapter'

import { getVerifyOTP } from '@/services/auth.api'
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
    <div>
      <h1>Confirm Your Login</h1>
      <p>Click below to finish logging in.</p>
      <button onClick={handleVerify}>Confirm</button>
    </div>
  )
}
