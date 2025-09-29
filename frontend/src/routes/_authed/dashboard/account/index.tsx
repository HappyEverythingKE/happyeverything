import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useSuspenseQuery } from '@tanstack/react-query'

import {
  accountQueryOptions,
  useDeleteAccount,
  useUpdateAccount,
} from '@/services/account.api'
import { useCreateProfile } from '@/services/profile.api'
import { AccountSchema, ProfileSlugSchema } from '@shared/types'
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  EditIcon,
  TrashIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { z } from 'zod'

import { supabase } from '@/lib/supabase'
import { cn, populateCountries, prettifyInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FieldInfo } from '@/components/field-info'

export const Route = createFileRoute('/_authed/dashboard/account/')({
  component: RouteComponent,
})

const countries = populateCountries()

function RouteComponent() {
  const navigate = useNavigate()
  const { data: account } = useSuspenseQuery(accountQueryOptions)
  const initials = prettifyInitials(account.name)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  // update account
  const { mutateAsync: updateAccount, isPending: isUpdatingAccount } =
    useUpdateAccount()

  // delete account
  const { mutateAsync: deleteAccount, isPending: isDeleting } =
    useDeleteAccount()

  // create profile
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useCreateProfile()

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
    setDeleteConfirmation('')
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
    setDeleteConfirmation('')
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmation === 'DELETE') {
      setShowDeleteDialog(false)
      handleDeleteAccount()
    }
  }

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
      console.error('Error deleting account', error)
    }
  }

  // TODO: Add email update functionality
  // const handleEmailChange = async () => {
  //   try {
  //     await updateEmail(email)
  //     toast.success('Your email has been updated.')
  //     setIsEditing(null)
  //   } catch (err) {
  //     toast.error('Failed to update email', { description: String(err) })
  //   }
  // }

  const defaultAccountValues = {
    name: account.name,
    country: account.country,
  } as z.infer<typeof AccountSchema>

  const accountForm = useForm({
    defaultValues: defaultAccountValues,
    validators: { onChange: AccountSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateAccount(value)
        toast.success('Account Updated.')
      } catch (error) {
        accountForm.setErrorMap({
          // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
          onSubmit: String(error) || 'Unexpected error',
        })
      }
    },
  })

  const defaultProfileSlugValues = {
    slug: account.profiles[0].slug,
  } as z.infer<typeof ProfileSlugSchema>

  const profileForm = useForm({
    defaultValues: defaultProfileSlugValues,
    validators: { onChange: ProfileSlugSchema },
    onSubmit: async ({ value }) => {
      try {
        const res = await updateProfile(value.slug)
        if (res.success) {
          toast.success('Profile Updated.')
        } else {
          toast.error('An error occurred', { description: res.error })
          profileForm.setErrorMap({
            // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
            onSubmit: res.error || 'Unexpected error',
          })
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to update profile.')
      }
    },
  })

  return (
    <div className="flex min-h-svh rounded-md">
      {/* Main Content */}
      <div className="flex-1 p-16">
        <div className="mx-auto max-w-xl space-y-10">
          {/* Heading Section */}
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

          {/* Account Details Form */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl">Account details</h2>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                accountForm.handleSubmit()
              }}
            >
              <div className="flex flex-col gap-8">
                <div className="flex-1 space-y-3">
                  <accountForm.Field
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
                          <FieldInfo field={field} />
                        </>
                      )
                    }}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <accountForm.Field
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

              <accountForm.Subscribe
                selector={(state) => [state.errorMap]}
                children={([errorMap]) =>
                  errorMap.onSubmit ? (
                    <div className="border-destructive mt-3 flex flex-col gap-2 rounded-md border bg-red-50 p-2 text-sm">
                      <p className="text-destructive font-medium">
                        An error occurred:
                      </p>
                      <p className="text-destructive">{errorMap.onSubmit}</p>
                    </div>
                  ) : null
                }
              />

              {/* Account Form submission */}
              <accountForm.Subscribe
                selector={(state) => [
                  state.canSubmit,
                  state.isSubmitting,
                  state.isPristine,
                ]}
                children={([canSubmit, isSubmitting, isPristine]) => (
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        !canSubmit ||
                        isPristine ||
                        isSubmitting ||
                        isUpdatingAccount
                      }
                    >
                      {isSubmitting || isUpdatingAccount
                        ? 'Working...'
                        : 'Save'}
                    </Button>
                  </div>
                )}
              />
            </form>
          </div>

          {/* Manage Profiles */}
          <div className="flex flex-col gap-4 border-t pt-8">
            <h2 className="text-xl">Manage your profiles</h2>
            <div className="flex flex-col gap-4">
              {account.profiles.map((profile) => (
                <Card
                  className="grid max-w-sm grid-cols-3 items-center p-4"
                  key={profile.slug}
                >
                  <CardTitle className="col-span-1">{profile.slug}</CardTitle>
                  <div className="col-span-1 flex gap-4 text-center">
                    <Button asChild variant="link">
                      <Link
                        to="/dashboard/$profileSlug"
                        params={{ profileSlug: profile.slug }}
                        className="group"
                      >
                        {profile.lists.length}{' '}
                        {profile.lists.length === 1 ? 'List' : 'Lists'}
                        <ChevronRight className="-ml-1.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                  <div className="col-span-1 flex justify-end gap-4">
                    {/* Edit Profile Form */}
                    <Dialog>
                      <form
                        className="flex flex-col gap-6"
                        onSubmit={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          profileForm.handleSubmit()
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <EditIcon />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Edit your profile username
                            </DialogTitle>
                            <DialogDescription>
                              Your username will be used to make your shareable
                              link unique.
                            </DialogDescription>
                          </DialogHeader>
                          <profileForm.Field
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
                                      value={field.state.value as string}
                                      onBlur={field.handleBlur}
                                      onChange={(e) =>
                                        field.handleChange(e.target.value)
                                      }
                                      aria-invalid={!field.state.meta.isValid}
                                      className="pl-7"
                                      maxLength={20}
                                    />
                                  </div>
                                  <FieldInfo field={field} />
                                </>
                              )
                            }}
                          />

                          {/* URL preview */}
                          <profileForm.Subscribe
                            selector={(state) => [state.values.slug]}
                            children={([slugValue]) => (
                              <div className="wrap-anywhere text-center text-sm text-gray-500">
                                happyeverything.com/{slugValue || ''}
                              </div>
                            )}
                          />

                          <profileForm.Subscribe
                            selector={(state) => [state.errorMap]}
                            children={([errorMap]) =>
                              errorMap.onSubmit ? (
                                <p className="text-destructive text-center text-sm font-medium">
                                  {errorMap.onSubmit}
                                </p>
                              ) : null
                            }
                          />

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            {/* Form submission */}
                            <profileForm.Subscribe
                              selector={(state) => [
                                state.canSubmit,
                                state.isSubmitting,
                                state.isPristine,
                              ]}
                              children={([
                                canSubmit,
                                isSubmitting,
                                isPristine,
                              ]) => (
                                <Button
                                  type="submit"
                                  disabled={
                                    !canSubmit ||
                                    isPristine ||
                                    isSubmitting ||
                                    isUpdatingProfile
                                  }
                                >
                                  {isSubmitting || isUpdatingProfile
                                    ? 'Working...'
                                    : 'Update'}
                                </Button>
                              )}
                            />
                          </DialogFooter>
                        </DialogContent>
                      </form>
                    </Dialog>

                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="destructive" size="icon">
                          <TrashIcon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete profile</TooltipContent>
                    </Tooltip>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Manage Account */}
          <div className="flex flex-col gap-4 border-t pt-8">
            <h2 className="text-xl">Manage account</h2>
            <div className="flex flex-col justify-between gap-2">
              <div>
                <Label className="text-base font-semibold">
                  Delete account
                </Label>
                <p>Permanently delete your Happy Everything account.</p>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription className="text-pretty">
              This action cannot be undone. This will permanently delete your
              account and remove all of your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="delete-confirmation" className="block">
                To confirm, type <strong>DELETE</strong> in the box below:
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteConfirmation !== 'DELETE' || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
