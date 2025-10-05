import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { useUpdateAccount } from '@/services/account.api'
import { useCreateProfile } from '@/services/profile.api'
import { AccountSchema, ProfileSlugSchema } from '@shared/types'
import { ArrowLeft, Check, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import type { z } from 'zod'

import { cn, populateCountries } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Spinner } from '@/components/ui/spinner'
import { FieldInfo } from '@/components/field-info'

const defaultValuesAccount = {
  name: '',
  country: '',
} as z.infer<typeof AccountSchema>

const defaultValuesProfileSlug = {
  slug: '',
} as z.infer<typeof ProfileSlugSchema>

const countries = populateCountries()

export function OnboardingForm() {
  const navigate = useNavigate()
  const { mutateAsync: createProfile } = useCreateProfile()
  const { mutateAsync: updateAccount } = useUpdateAccount()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  // Step 1: Account form (name and country)
  const formAccount = useForm({
    defaultValues: defaultValuesAccount,
    validators: { onChange: AccountSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateAccount(value)
        setCurrentStep(2)
      } catch (error) {
        console.error('Error onboarding account:', error)
        formAccount.setErrorMap({
          // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
          onSubmit:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        })
      }
    },
  })

  // Step 2: Profile slug form
  const formProfileSlug = useForm({
    defaultValues: defaultValuesProfileSlug,
    validators: { onChange: ProfileSlugSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await createProfile(value.slug)
        if (res.success) {
          toast.success('Profile created successfully!')
          navigate({
            to: '/dashboard/$profileSlug',
            params: { profileSlug: res.data.slug },
          })
        }
      } catch (error) {
        console.error('Error onboarding profile:', error)
        formProfileSlug.setErrorMap({
          // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
          onSubmit:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        })
      }
    },
  })

  const handleBackToStep1 = () => {
    setCurrentStep(1)
  }

  return (
    <Card className="flex max-w-[90vw] flex-1 md:w-full md:max-w-lg">
      <CardHeader className="gap-3">
        <div className="flex-1">
          <CardTitle className="text-lg">
            {currentStep === 1 ? "Let's get started!" : 'Claim your username'}
          </CardTitle>
          <CardDescription className="text-balance text-base">
            {currentStep === 1
              ? 'Tell us about yourself to create your account.'
              : 'Your username is used to make your unique shareable link.'}
          </CardDescription>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-2 w-full rounded-full transition-colors',
              currentStep >= 1 ? 'bg-primary' : 'bg-muted',
            )}
          />
          <div
            className={cn(
              'h-2 w-full rounded-full transition-colors',
              currentStep >= 2 ? 'bg-primary' : 'bg-muted',
            )}
          />
        </div>
      </CardHeader>

      <CardContent className="py-6">
        {currentStep === 1 && (
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              formAccount.handleSubmit()
            }}
          >
            <div className="grid gap-6">
              <div className="grid gap-2">
                <formAccount.Field
                  name="name"
                  children={(field) => {
                    return (
                      <>
                        <Label htmlFor={field.name}>Name</Label>
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
                <formAccount.Field
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
                                !field.state.value &&
                                  'text-muted-foreground/60',
                              )}
                            >
                              {field.state.value
                                ? countries.find(
                                    (country) =>
                                      country.value === field.state.value,
                                  )?.label
                                : 'Select your country'}
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
            </div>

            <formAccount.Subscribe
              selector={(state) => [state.errorMap]}
              children={([errorMap]) =>
                errorMap.onSubmit ? (
                  <p className="text-destructive overflow-hidden text-clip text-center text-sm font-medium">
                    {errorMap.onSubmit}
                  </p>
                ) : null
              }
            />

            <formAccount.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.isPristine,
              ]}
              children={([canSubmit, isSubmitting, isPristine]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isPristine || isSubmitting}
                  className="mt-2 w-full"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Saving
                    </span>
                  ) : (
                    'Continue'
                  )}
                </Button>
              )}
            />
          </form>
        )}

        {currentStep === 2 && (
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              formProfileSlug.handleSubmit()
            }}
          >
            <div className="grid gap-2">
              <div className="grid gap-2">
                <Label htmlFor="slug">Enter your username</Label>
                <formProfileSlug.Field
                  name="slug"
                  children={(field) => {
                    return (
                      <>
                        <div className="relative overflow-hidden">
                          <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                            @
                          </span>
                          <Input
                            id={field.name}
                            type="text"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={!field.state.meta.isValid}
                            className="pl-7"
                            maxLength={20}
                            placeholder="username"
                          />
                        </div>
                        <FieldInfo field={field} />
                      </>
                    )
                  }}
                />
              </div>

              {/* URL preview */}
              <formProfileSlug.Subscribe
                selector={(state) => [state.values.slug]}
                children={([slugValue]) => (
                  <div className="wrap-anywhere text-center text-sm text-gray-500">
                    happyeverything.com/{slugValue || 'username'}
                  </div>
                )}
              />
            </div>

            <formProfileSlug.Subscribe
              selector={(state) => [state.errorMap]}
              children={([errorMap]) =>
                errorMap.onSubmit ? (
                  <p className="text-destructive overflow-hidden text-clip text-center text-sm font-medium">
                    {errorMap.onSubmit}
                  </p>
                ) : null
              }
            />

            <formProfileSlug.Subscribe
              selector={(state) => [
                state.canSubmit,
                state.isSubmitting,
                state.isPristine,
              ]}
              children={([canSubmit, isSubmitting, isPristine]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isPristine || isSubmitting}
                  className="mt-2 w-full"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Creating Profile
                    </span>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            />
          </form>
        )}

        {currentStep === 2 && (
          <div className="mt-3 flex flex-col">
            <Button
              variant="link"
              className="p-0 text-xs text-gray-500"
              onClick={handleBackToStep1}
            >
              <div className="flex items-center gap-0.5">
                <ArrowLeft className="h-4 w-4" /> Back to Account Info
              </div>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
