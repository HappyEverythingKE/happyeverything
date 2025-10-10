import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { updatePassword } from '@/services/auth.api'
import { PasswordSchema } from '@shared/types'
import { Eye, EyeClosed } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { FieldInfo } from '@/components/field-info'

export const Route = createFileRoute('/auth/new-password')({
  beforeLoad: async ({ context }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: RouteComponent,
})

const defaultValues = {
  password: '',
} as z.infer<typeof PasswordSchema>

function RouteComponent() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const newPasswordForm = useForm({
    defaultValues: defaultValues,
    validators: { onChange: PasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await updatePassword(value.password)
        if (res.success) {
          toast.success('Password updated')
          navigate({ to: '/login' })
          return
        }
      } catch (error) {
        newPasswordForm.setErrorMap({
          // @ts-expect-error onSubmit expects a map
          onSubmit: (error as Error).message,
        })
        toast.error('An unexpected error occurred')
      }
    },
  })

  return (
    <Card className="mx-4 w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">Create a new password</CardTitle>
        <CardDescription className="text-balance text-base">
          Enter a new password for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            newPasswordForm.handleSubmit()
          }}
        >
          <div className="grid gap-2">
            <newPasswordForm.Field
              name="password"
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>New password</Label>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      type={showPassword ? 'text' : 'password'}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={!field.state.meta.isValid}
                      placeholder="Your new password"
                      autoComplete="new-password"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Show"
                        title="Show password"
                        size="icon-xs"
                        onClick={() => {
                          setShowPassword(!showPassword)
                        }}
                      >
                        {showPassword ? <EyeClosed /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          <newPasswordForm.Subscribe
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

          <newPasswordForm.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.isPristine,
            ]}
            children={([canSubmit, isSubmitting, isPristine]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isPristine || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Updating...
                  </span>
                ) : (
                  'Update password'
                )}
              </Button>
            )}
          />
        </form>
      </CardContent>
    </Card>
  )
}
