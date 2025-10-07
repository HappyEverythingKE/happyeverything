import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { LoginForm } from '@/components/auth/login-form'
import { RequestPasswordForm } from '@/components/auth/request-password-form'

export function LoginPage() {
  const [resetPassword, setResetPassword] = useState<boolean>(false)

  return (
    <>
      <div className="mx-auto max-w-xs pt-6 md:pt-0">
        {resetPassword ? (
          <RequestPasswordForm setResetPassword={setResetPassword} />
        ) : (
          <LoginForm setResetPassword={setResetPassword} />
        )}

        <div className="mt-6 flex flex-col gap-6">
          <div className="text-center text-sm">
            Don&apos;t have an account yet?{' '}
            <Button asChild variant="link" className="p-0">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          <div>
            <p className="text-center text-xs text-gray-500">
              By creating an account, you agree to Happy Everything’s Terms of
              Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
