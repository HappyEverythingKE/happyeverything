import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { postSignup } from '@/services/auth.api'
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

export function SignupForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: SignupSchema },
    onSubmit: async ({ value }) => {
      const res = await postSignup({
        email: value.email,
        password: value.password,
      })
      if (res.success) {
        navigate({ to: '/auth/confirm-email' })
      } else {
        form.setErrorMap({
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
            form.handleSubmit()
          }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl md:pb-2">Sign Up</h1>
            <p className="text-balance">
              Create and share your own wish lists today!
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <form.Field
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
                      />
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
            </div>

            <div className="grid gap-2">
              <form.Field
                name="password"
                children={(field) => {
                  return (
                    <>
                      <Label htmlFor={field.name}>Password</Label>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          type={showPassword ? 'text' : 'password'}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={!field.state.meta.isValid}
                          placeholder="Enter your password"
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
                  )
                }}
              />
            </div>

            <form.Subscribe
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
            <form.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.isPristine,
              ]}
              children={([canSubmit, isSubmitting, isPristine]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isPristine || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Beep Boop...
                    </span>
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              )}
            />
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-6">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button asChild variant="link" className="p-0">
              <Link to="/login">Log In</Link>
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
