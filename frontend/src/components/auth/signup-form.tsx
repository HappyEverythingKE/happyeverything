import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'

import { postSignup } from '@/services/auth.api'
import { SignupSchema } from '@shared/types'
import { toast } from 'sonner'
import { type z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldInfo } from '@/components/field-info'

const defaultValues = {
  email: '',
  password: '',
} as z.infer<typeof SignupSchema>

export function SignupForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: SignupSchema },
    onSubmit: async ({ value }) => {
      const res = await postSignup(value.email, value.password)
      if (res.success) {
        router.invalidate()
        await navigate({ to: '/dashboard' })
        return null
      } else {
        if (!res.isFormError) {
          return toast.error('Signup failed', { description: res.error })
        }
        form.setErrorMap({
          onSubmit: res.error || 'Unexpected error',
        })
      }
    },
  })

  return (
    <>
      <div className="mx-auto max-w-xs">
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl">Sign Up</h1>
            <p className="text-balance text-sm">
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
                      <Input
                        id={`new-${field.name}`}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={!field.state.meta.isValid}
                        autoComplete="new-password"
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
                  <p className="text-destructive text-[0.8rem] font-medium">
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
                  {isSubmitting ? 'Working...' : 'Sign Up'}
                </Button>
              )}
            />
          </div>
        </form>

        {/* Google Auth */}
        <div className="mt-6 flex flex-col gap-6">
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background relative z-10 px-2">
              Or continue with
            </span>
          </div>
          {/* <Button
            variant="outline"
            className="w-full"
            onClick={handleOAuth}
            disabled={signInWithOAuth.isPending}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            {signInWithOAuth.isPending ? 'Working...' : 'Sign up with Google'}
          </Button> */}

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button asChild variant="link" className="p-0">
              <Link to="/">Log in</Link>
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
