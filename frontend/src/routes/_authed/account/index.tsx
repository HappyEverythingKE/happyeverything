import { useState } from 'react'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useSuspenseQuery } from '@tanstack/react-query'

import IconLogo from '@/assets/logos/logo-icon.svg'
import { accountQueryOptions } from '@/services/account.api'
import { AccountSchema } from '@shared/types'
import { Settings, Sidebar, Users } from 'lucide-react'
import type { z } from 'zod'

import { prettifyInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { NavSidebar } from '@/components/dashboard/nav-sidebar'
import { FieldInfo } from '@/components/field-info'

export const Route = createFileRoute('/_authed/account/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: account } = useSuspenseQuery(accountQueryOptions)
  const [isEditing, setIsEditing] = useState<string | null>(null)

  const initials = prettifyInitials(account.name)

  const handleEdit = (field: string) => {
    setIsEditing(field)
  }

  const handleSave = () => {
    setIsEditing(null)
  }

  const handleCancel = () => {
    setIsEditing(null)
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
    },
  })

  return (
    <div className="flex min-h-svh">
      {/* Sidebar */}
      <div className="bg-sidebar border-sidebar-border w-64 border-r p-6">
        <div className="mb-8 flex items-center gap-2">
          {/* <Button size="lg" asChild className="hover:bg-sidebar bg-transparent"> */}
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
          {/* </Button> */}
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-16">
        <div className="mx-auto max-w-2xl space-y-16">
          {/* Account Section */}
          <div className="flex flex-col gap-4">
            <Avatar className="h-20 w-20 rounded-full">
              <AvatarImage src={account.avatar} alt={account.name} />
              <AvatarFallback className="rounded-full text-xl font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl">{account.name}</h1>
              <p>{account.email}</p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-6">
            <h2 className="text-xl">Account details</h2>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
            >
              {/* Name Field */}
              <div className="border-border flex items-center justify-between border-b py-4">
                <div className="flex-1 space-y-3">
                  <form.Field
                    name="name"
                    children={(field) => {
                      return (
                        <>
                          <Label htmlFor={field.name}>Name</Label>
                          {isEditing === 'name' ? (
                            <>
                              <div className="mt-2 flex items-center gap-2">
                                <Input
                                  type="text"
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  aria-invalid={!field.state.meta.isValid}
                                  onBlur={field.handleBlur}
                                  placeholder="Your full name"
                                  maxLength={31}
                                />
                                <Button size="sm" onClick={handleSave}>
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                >
                                  Cancel
                                </Button>
                              </div>
                              <div className="-mt-1 ml-1">
                                <p className="text-xs text-gray-500">
                                  {field.state.value.length}/31 characters
                                </p>
                                <FieldInfo field={field} />
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground mt-1">
                              {field.state.value}
                            </p>
                          )}
                        </>
                      )
                    }}
                  />
                </div>
                {isEditing !== 'name' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('name')}
                  >
                    Edit
                  </Button>
                )}
              </div>

              {/* Email Field */}
              {/* <div className="border-border flex items-center justify-between border-b py-4">
                <div className="flex-1">
                  <Label className="text-foreground text-sm font-medium">
                    Email address
                  </Label>
                  {isEditing === 'email' ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="email"
                        value={account.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="bg-input border-border text-foreground rounded-md border px-3 py-2"
                      />
                      <Button size="sm" onClick={handleSave}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-1">
                      {formData.email}
                    </p>
                  )}
                </div>
                {isEditing !== 'email' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('email')}
                    className="text-primary hover:text-primary/80"
                  >
                    Edit
                  </Button>
                )}
              </div> */}

              {/* Country Field */}
              {/* <div className="border-border flex items-center justify-between border-b py-4">
                <div className="flex-1">
                  <Label className="text-foreground text-sm font-medium">
                    Country
                  </Label>
                  {isEditing === 'country' ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          setFormData({ ...formData, country: value })
                        }
                      >
                        <SelectTrigger className="bg-input border-border rounded-md border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="United States">
                            United States
                          </SelectItem>
                          <SelectItem value="United Kingdom">
                            United Kingdom
                          </SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Germany">Germany</SelectItem>
                          <SelectItem value="France">France</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                          <SelectItem value="Brazil">Brazil</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={handleSave}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground mt-1">
                      {formData.country}
                    </p>
                  )}
                </div>
                {isEditing !== 'country' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit('country')}
                    className="text-primary hover:text-primary/80"
                  >
                    Edit
                  </Button>
                )}
              </div> */}

              {/* Password Field */}
              {/* <div className="border-border flex items-center justify-between border-b py-4">
                <div className="flex-1">
                  <Label className="text-foreground text-sm font-medium">
                    Password
                  </Label>
                  <p className="text-muted-foreground mt-1">No password yet</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                >
                  Create new
                </Button>
              </div> */}
            </form>
          </div>

          {/* Manage Account */}
          <div>
            <h2 className="mb-6 text-xl">Manage account</h2>

            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-sm">Delete account</h3>
                <p className="text-muted-foreground text-sm">
                  Permanently delete your Happy Everything account.
                </p>
              </div>
              <Button variant="destructive">Delete</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
