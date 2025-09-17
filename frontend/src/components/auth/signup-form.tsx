import { Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { postSignup } from '@/services/auth.api'
import { SignupSchema } from '@shared/types'
import { Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { type z } from 'zod'

import { cn, populateCountries } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FieldInfo } from '@/components/field-info'

const defaultValues = {
  email: '',
  name: '',
  country: '',
} as z.infer<typeof SignupSchema>

const countries = populateCountries()

export function SignupForm() {
  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: SignupSchema },
    onSubmit: async ({ value }) => {
      const res = await postSignup({
        email: value.email,
        name: value.name,
        country: value.country,
      })
      if (res.success) {
        toast.success('Check your email for a sign up link!')
      } else {
        toast.error('Sign up failed', { description: res.error })
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
            <h1 className="text-3xl md:pb-2">Sign Up</h1>
            <p className="text-balance">
              Create and share your own wish lists today!
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <form.Field
                name="name"
                children={(field) => {
                  return (
                    <>
                      <Label htmlFor={field.name}>What is your name?</Label>
                      <Input
                        id={field.name}
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={!field.state.meta.isValid}
                        placeholder="Your full name"
                      />
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
            </div>

            <div className="grid gap-2">
              <form.Field
                name="country"
                children={(field) => {
                  return (
                    <>
                      <Label htmlFor={field.name}>Country</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'border-input text-foreground w-full justify-between rounded-sm font-normal hover:bg-transparent focus-visible:ring-1',
                              !field.state.value && 'text-muted-foreground/60',
                            )}
                          >
                            {field.state.value
                              ? countries.find(
                                  (country) =>
                                    country.value === field.state.value,
                                )?.label
                              : 'Select country'}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search countries..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No country found.</CommandEmpty>
                              <CommandGroup>
                                {countries.map((country) => (
                                  <CommandItem
                                    className="data-[selected=true]:bg-accent"
                                    value={country.label}
                                    key={country.value}
                                    onSelect={() => {
                                      field.setValue(country.value)
                                    }}
                                  >
                                    {country.label}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        country.value === field.state.value
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
            </div>

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
                  {isSubmitting ? 'Working...' : 'Sign Up'}
                </Button>
              )}
            />
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-6">
          <div className="text-center">
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
