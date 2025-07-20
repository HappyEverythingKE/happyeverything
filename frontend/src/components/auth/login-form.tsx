import { Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { postLogin } from '@/services/auth.api'
import { LoginSchema } from '@shared/types'
import { toast } from 'sonner'
import { type z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldInfo } from '@/components/field-info'

const defaultValues = {
  email: '',
} as z.infer<typeof LoginSchema>

export function LoginForm() {
  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: LoginSchema },
    onSubmit: async ({ value }) => {
      const res = await postLogin({ email: value.email })
      if (res.success) {
        toast.success('Check your email for a login link!')
      } else {
        toast.error('Login failed', { description: res.error })
        form.setErrorMap({
          // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
          onSubmit: res.error || 'Unexpected error',
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
            <h1 className="text-3xl md:pb-2">Welcome back!</h1>
            <p className="text-balance">Log in to manage your wish lists</p>
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

            <form.Subscribe
              selector={(state) => [state.errorMap]}
              children={([errorMap]) =>
                errorMap.onSubmit ? (
                  <p className="text-destructive text-sm font-medium">
                    {errorMap.onSubmit}
                  </p>
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
                  {isSubmitting ? 'Working...' : 'Log In'}
                </Button>
              )}
            />
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-6">
          <div className="text-center">
            Don&apos;t have an account yet?{' '}
            <Button asChild variant="link" className="p-0">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          <div>
            <p className="text-center text-xs text-gray-500">
              By creating an account, you agree to My Happy Everything’s Terms
              of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
