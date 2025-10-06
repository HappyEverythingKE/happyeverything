import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

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
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/auth/auth-confirm')({
  component: RouteComponent,
})

const EmailSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
})

function RouteComponent() {
  const [sending, setSending] = useState<boolean>(false)
  const [email, setEmail] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const resendConfirmationEmail = async () => {
    if (!email) return

    // Validate email before submitting
    const parsed = EmailSchema.safeParse({ email })
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message || 'Invalid email')
      return
    }

    setSending(true)
    try {
      await postResendConfirmationEmail(email)
      toast.success('Check your email for a new confirmation link.')
      setEmail(null)
      setEmailError(null)
    } catch (error) {
      console.error(error)
      toast.error('Failed to resend confirmation email', {
        description: 'Please try again',
      })
    }
    setSending(false)
  }

  return (
    <Card className="mx-4 w-full max-w-md md:px-2 md:py-8">
      <CardHeader className="space-y-4">
        <CardTitle className="text-center text-lg">
          Confirm your email
        </CardTitle>
        <CardDescription className="text-balance text-center text-base">
          Please check your email for a confirmation link and complete your sign
          up.
        </CardDescription>
      </CardHeader>
      <CardFooter className="text-muted-foreground flex flex-col items-center justify-center gap-4 text-sm">
        <p className="text-balance text-center">
          Didn&apos;t receive the email?
          <br /> Enter the same email you used to sign up below.
        </p>
        <div className="flex w-full flex-col gap-2 md:flex-row">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email || ''}
            autoComplete="username"
            onChange={(e) => {
              const value = e.target.value
              setEmail(value)
              if (!value) {
                setEmailError(null)
                return
              }
              const parsed = EmailSchema.safeParse({ email: value })
              setEmailError(
                parsed.success
                  ? null
                  : parsed.error.issues[0]?.message || 'Invalid email',
              )
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={sending || !email || !!emailError}
            onClick={resendConfirmationEmail}
          >
            Resend
          </Button>
        </div>
        {emailError ? (
          <p className="text-destructive text-center text-xs">{emailError}</p>
        ) : null}
      </CardFooter>
    </Card>
  )
}
