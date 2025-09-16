import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useSuspenseQuery } from '@tanstack/react-query'

import IconLogo from '@/assets/logos/logo-icon.svg'
import {
  accountQueryOptions,
  useDeleteAccount,
  useUpdateAccount,
} from '@/services/account.api'
import { AccountSchema } from '@shared/types'
import { Check, ChevronsUpDown, Settings, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { z } from 'zod'

import { supabase } from '@/lib/supabase'
import { cn, populateCountries, prettifyInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'
import { FieldInfo } from '@/components/field-info'

export const Route = createFileRoute('/_authed/account/')({
  component: RouteComponent,
})

const countries = populateCountries()

function RouteComponent() {
  const navigate = useNavigate()

  const { data: account } = useSuspenseQuery(accountQueryOptions)

  const initials = prettifyInitials(account.name)

  // update account
  const { mutateAsync: updateAccount } = useUpdateAccount()
  // delete account
  const { mutateAsync: deleteAccount } = useDeleteAccount()

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      await supabase.auth.signOut() // client-side logout
      toast.success('Account Deleted.')
      navigate({
        to: '/',
      })
      return null
    } catch (error) {
      toast.error('An error occurred.', { description: String(error) })
    }
  }

  const defaultValues = {
    name: account.name,
    email: account.email,
    country: account.country,
    avatar: account.avatar,
  } as z.infer<typeof AccountSchema>

  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: AccountSchema },
    onSubmit: async ({ value }) => {
      console.log(value)
      await updateAccount(value)
      toast.success('Account Updated.')
      navigate({
        to: '/account',
      })
    },
  })

  return (
    <div className="flex min-h-svh">
      {/* Sidebar */}
      {/* <div className="bg-sidebar border-sidebar-border w-64 border-r p-6">
        <div className="mb-8 flex items-center gap-2">
          <Link to="/">
            <div className="flex items-center justify-center">
              <img
                src={IconLogo}
                alt="My Happy Everything"
                className="size-22 aspect-square"
                width="110px"
                height="62px"
              />
            </div>
          </Link>
        </div>

        <nav className="space-y-2">
          <div className="bg-sidebar-accent text-sidebar-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Account</span>
          </div>
          <div className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2 transition-colors">
            <Users className="h-4 w-4" />
            <span className="text-sm">Profiles</span>
          </div>
        </nav>
      </div> */}

      {/* Main Content */}
      <div className="flex-1 p-16">
        <div className="mx-auto max-w-xl space-y-10">
          {/* Account Section */}
          <div className="flex flex-col gap-4">
            <Avatar className="h-20 w-20 rounded-full">
              <AvatarImage src={account.avatar} alt={account.name} />
              <AvatarFallback className="rounded-full text-xl font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl">{account.name}</h1>
              <p>{account.email}</p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg">Account details</h2>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
            >
              <div className="flex flex-col gap-8">
                <div className="flex-1 space-y-3">
                  <form.Field
                    name="name"
                    children={(field) => {
                      return (
                        <>
                          <Label htmlFor={field.name}>Name</Label>
                          <Input
                            type="text"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={!field.state.meta.isValid}
                            onBlur={field.handleBlur}
                            placeholder="Your full name"
                            maxLength={31}
                          />
                          <p className="-mt-1 ml-1 text-xs text-gray-500">
                            This will be visible on your profile page.
                          </p>
                          <FieldInfo field={field} />
                        </>
                      )
                    }}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <form.Field
                    name="email"
                    children={(field) => {
                      return (
                        <>
                          <Label htmlFor={field.name}>Email</Label>
                          <Input
                            type="email"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            aria-invalid={!field.state.meta.isValid}
                            placeholder="Your email address"
                            autoComplete="email"
                          />
                          <p className="-mt-1 ml-1 text-xs text-gray-500">
                            All communications will be sent to this email
                            address.
                          </p>
                          <FieldInfo field={field} />
                        </>
                      )
                    }}
                  />
                </div>

                <div className="flex-1 space-y-3">
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
                                  !field.state.value &&
                                    'text-muted-foreground/60',
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
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!canSubmit || isPristine || isSubmitting}
                    >
                      {isSubmitting ? 'Working...' : 'Save'}
                    </Button>
                  </div>
                )}
              />
            </form>
          </div>

          {/* Manage Account */}
          <div className="flex flex-col gap-4 border-t pt-8">
            <h2 className="text-lg">Manage account</h2>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-md font-bold">Delete account</Label>
                <p className="text-sm">
                  Permanently delete your Happy Everything account.
                </p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
