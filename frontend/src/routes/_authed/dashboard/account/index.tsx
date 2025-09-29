import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useSuspenseQuery } from '@tanstack/react-query'

import {
  accountQueryOptions,
  useDeleteAccount,
  useUpdateAccount,
} from '@/services/account.api'
import { useDeleteProfile } from '@/services/profile.api'
import { AccountSchema } from '@shared/types'
import {
  Check,
  ChevronsUpDown,
  EditIcon,
  PlusIcon,
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
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ProfileForm } from '@/components/dashboard/forms/profile-form'
import { FieldInfo } from '@/components/field-info'

export const Route = createFileRoute('/_authed/dashboard/account/')({
  component: RouteComponent,
})

const countries = populateCountries()

function RouteComponent() {
  const navigate = useNavigate()
  const { data: account } = useSuspenseQuery(accountQueryOptions)
  const initials = prettifyInitials(account.name)

  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState('')
  const [showDeleteProfileDialog, setShowDeleteProfileDialog] = useState(false)
  const [deleteProfileConfirmation, setDeleteProfileConfirmation] = useState('')
  const [selectedProfileSlug, setSelectedProfileSlug] = useState<string>('')

  // update account
  const { mutateAsync: updateAccount, isPending: isUpdatingAccount } =
    useUpdateAccount()

  // delete account
  const { mutateAsync: deleteAccount, isPending: isDeleting } =
    useDeleteAccount()

  // delete profile
  const { mutateAsync: deleteProfile, isPending: isDeletingProfile } =
    useDeleteProfile()

  const handleDeleteAccountClick = () => {
    setShowDeleteAccountDialog(true)
    setDeleteAccountConfirmation('')
  }

  const handleCancelDeleteAccount = () => {
    setShowDeleteAccountDialog(false)
    setDeleteAccountConfirmation('')
  }

  const handleConfirmDeleteAccount = () => {
    if (deleteAccountConfirmation === 'DELETE') {
      setShowDeleteAccountDialog(false)
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

  const handleDeleteProfileClick = (profileSlug: string) => {
    setSelectedProfileSlug(profileSlug)
    setShowDeleteProfileDialog(true)
    setDeleteProfileConfirmation('')
  }

  const handleCancelDeleteProfile = () => {
    setShowDeleteProfileDialog(false)
    setDeleteProfileConfirmation('')
    setSelectedProfileSlug('')
  }

  const handleConfirmDeleteProfile = () => {
    if (
      deleteProfileConfirmation.toLowerCase() ===
      selectedProfileSlug.toLowerCase()
    ) {
      setShowDeleteProfileDialog(false)
      handleDeleteProfile(selectedProfileSlug)
      setSelectedProfileSlug('')
    }
  }

  const handleDeleteProfile = async (profileSlug: string) => {
    try {
      await deleteProfile(profileSlug)
      toast.success('Profile Deleted.')
    } catch (error) {
      toast.error('An error occurred.', { description: String(error) })
      console.error('Error deleting profile', error)
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
        console.error('Error updating account', error)
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
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => field.handleChange(e.target.value)}
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
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl">Manage your profiles</h2>
              {account.profiles.length < 3 && (
                <ProfileForm
                  mode="create"
                  defaultValues={{ slug: '' }}
                  trigger={
                    <Button variant="outline" size="sm">
                      <PlusIcon className="h-4 w-4 md:mr-2" />
                      Add Profile
                    </Button>
                  }
                />
              )}
            </div>
            <div className="flex flex-col gap-4">
              {account.profiles.map((profile) => (
                <Card
                  className="grid grid-cols-1 items-center overflow-hidden p-4 lg:grid-cols-3"
                  key={profile.slug}
                >
                  <CardTitle className="col-span-2 lg:col-span-1">
                    {profile.slug}
                  </CardTitle>
                  <div className="col-span-1 flex gap-2 lg:gap-4">
                    <Button asChild variant="link" className="px-0 lg:px-6">
                      <Link
                        to="/dashboard/$profileSlug"
                        params={{ profileSlug: profile.slug }}
                        className="group underline underline-offset-2 hover:underline"
                      >
                        {profile.lists.length}{' '}
                        {profile.lists.length === 1 ? 'List' : 'Lists'}
                      </Link>
                    </Button>
                  </div>
                  <div className="col-span-1 flex justify-end gap-4">
                    {/* Edit Profile Form */}
                    <ProfileForm
                      mode="update"
                      currentSlug={profile.slug}
                      defaultValues={{ slug: profile.slug }}
                      trigger={
                        <Button variant="outline" size="icon">
                          <EditIcon />
                        </Button>
                      }
                    />

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteProfileClick(profile.slug)}
                    >
                      <TrashIcon />
                    </Button>
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
                  onClick={handleDeleteAccountClick}
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
      <Dialog
        open={showDeleteAccountDialog}
        onOpenChange={setShowDeleteAccountDialog}
      >
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
                value={deleteAccountConfirmation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDeleteAccountConfirmation(e.target.value)
                }
                placeholder="Type DELETE to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDeleteAccount}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteAccount}
              disabled={deleteAccountConfirmation !== 'DELETE' || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Confirmation Dialog */}
      <Dialog
        open={showDeleteProfileDialog}
        onOpenChange={setShowDeleteProfileDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
            <DialogDescription className="text-pretty">
              This action cannot be undone. This will permanently delete this
              profile and remove its lists from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="delete-confirmation" className="block">
                To confirm, type <strong>{selectedProfileSlug}</strong> in the
                box below:
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteProfileConfirmation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDeleteProfileConfirmation(e.target.value)
                }
                placeholder={`Type ${selectedProfileSlug} to confirm`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDeleteProfile}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteProfile}
              disabled={
                deleteProfileConfirmation.toLowerCase() !==
                  selectedProfileSlug.toLowerCase() || isDeletingProfile
              }
            >
              {isDeletingProfile ? 'Deleting...' : 'Delete Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
