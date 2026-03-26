import { useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'

import { postLogin } from '@/services/auth.api'
import { allProfilesQueryOptions } from '@/services/profile.api'
import { SignupSchema } from '@shared/types'
import { Eye, EyeClosed } from 'lucide-react'
import { type z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { FieldInfo } from '@/components/field-info'

const defaultValues = {
  email: '',
  password: '',
} as z.infer<typeof SignupSchema>

export function LoginForm({
  setResetPassword,
}: {
  setResetPassword: (resetPassword: boolean) => void
}) {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const loginForm = useForm({
    defaultValues: defaultValues,
    validators: { onChange: SignupSchema },
    onSubmit: async ({ value }) => {
      const res = await postLogin({
        email: value.email,
        password: value.password,
      })

      if (res.success) {
        await queryClient.invalidateQueries()
        await router.invalidate()

        // Navigate user based on profile status
        try {
          const profiles = await queryClient.ensureQueryData(
            allProfilesQueryOptions,
          )
          if (!profiles || profiles.length === 0) {
            navigate({ to: '/onboarding' })
          } else {
            navigate({ to: '/dashboard' })
          }
        } catch {
          // If profile fetch fails, try navigating to dashboard anyway
          navigate({ to: '/dashboard' })
        }
      } else {
        loginForm.setErrorMap({
          // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
          onSubmit: res.error || 'An unexpected error occurred',
        })
      }
    },
  })

  return (
    <>
      <div className="mx-auto max-w-xs pt-6 md:pt-0">
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            loginForm.handleSubmit()
          }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl md:pb-2">Welcome back!</h1>
            <p className="text-balance">Log in to manage your wish lists</p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <loginForm.Field
                name="email"
                children={(field) => {
                  return (
                    <>
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={!field.state.meta.isValid}
                        placeholder="me@example.com"
                        autoComplete="username"
                        required
                      />
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
            </div>

            <div className="grid gap-2">
              <loginForm.Field
                name="password"
                children={(field) => {
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={field.name}>Password</Label>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="p-0 text-xs underline"
                          onClick={() => {
                            setResetPassword(true)
                          }}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          type={showPassword ? 'text' : 'password'}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={!field.state.meta.isValid}
                          placeholder="Enter your password"
                          autoComplete="current-password"
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
                  )
                }}
              />
            </div>

            <loginForm.Subscribe
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

            {/* Form submission */}
            <loginForm.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
              ]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="mt-2 w-full"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Welcome Back...
                    </span>
                  ) : (
                    'Log In'
                  )}
                </Button>
              )}
            />
          </div>
        </form>
      </div>
    </>
  )
}
