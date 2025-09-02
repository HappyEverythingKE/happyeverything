import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { useShareList, useUpdateListStatus } from '@/services/list.api'
import { ListShareSchema, type List } from '@shared/types'
import { CheckIcon, CopyIcon, LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldInfo } from '@/components/field-info'

interface ShareListFormProps {
  profileSlug: string
  list: List
  onFormSubmit: () => void
  onFormCancel: () => void
}

export function ShareListForm({
  profileSlug,
  list,
  onFormSubmit,
  onFormCancel,
}: ShareListFormProps) {
  const [copied, setCopied] = useState(false)
  const shareableListLink = `${import.meta.env.VITE_APP_BASE_URL}/${profileSlug}/${list.slug}`

  // share list by setting privacy and password
  const { mutateAsync: shareList, isPending } = useShareList(
    profileSlug,
    list.slug,
  )
  // unpublish list
  const { mutateAsync: unpublishList, isPending: isUnpublishing } =
    useUpdateListStatus(profileSlug, list.slug)

  const handleListStatus = async () => {
    try {
      await unpublishList('draft')
      toast.success('List unpublished successfully.')
      onFormSubmit()
    } catch (error) {
      toast.error('An error occurred.', {
        description: String(error),
      })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableListLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy: ', { description: String(error) })
    }
  }

  const handleInstagramShare = () => {
    window.open('https://www.instagram.com', '_blank')
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableListLink)}`
    window.open(facebookUrl, '_blank')
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableListLink)}`
    window.open(twitterUrl, '_blank')
  }

  const form = useForm({
    defaultValues: {
      isPrivate: list.isPrivate,
      password: list.password || '',
    },
    onSubmit: async ({ value }) => {
      try {
        // Manually validating form data because of the boolean zod transformer
        const validatedData = ListShareSchema.parse(value)
        const res = await shareList(validatedData)
        if (res.success) {
          toast.success('List published successfully.')
          onFormSubmit()
        } else {
          toast.error('An error occurred.', { description: res.error })
          if (res.isFormError) {
            form.setErrorMap({
              // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
              onSubmit: res.error || 'Unexpected error',
            })
          }
        }
      } catch (error) {
        toast.error('An error occurred.', {
          description:
            error instanceof Error
              ? error.message
              : 'Please check your form inputs',
        })
      }
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <form
        className="space-y-8"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <form.Field
              name="isPrivate"
              children={(field) => {
                return (
                  <>
                    <div className="flex flex-col space-y-1">
                      <Label className="text-md font-bold" htmlFor={field.name}>
                        List visibility
                      </Label>
                      <p className="text-sm text-gray-700">
                        Choose who can see this list
                      </p>
                    </div>
                    <RadioGroup
                      defaultValue={list.isPrivate ? 'true' : 'false'}
                      onValueChange={(value) =>
                        field.handleChange(value === 'true')
                      }
                      aria-invalid={!field.state.meta.isValid}
                    >
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem id="public" value="false" />
                          <Label htmlFor="public">Public</Label>
                        </div>
                        <p className="ml-7 text-sm text-gray-700">
                          Anyone with a link can see this list
                        </p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-3">
                          <RadioGroupItem id="private" value="true" />
                          <Label htmlFor="private">Private</Label>
                        </div>
                        <p className="ml-7 text-sm text-gray-700">
                          Only people with the password can see this list
                        </p>
                      </div>
                    </RadioGroup>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-4">
            <form.Field
              name="password"
              children={(field) => {
                return (
                  <>
                    <div className="flex flex-col space-y-1">
                      <Label
                        className="text-md font-semibold"
                        htmlFor={field.name}
                      >
                        Add a password for extra privacy
                      </Label>
                      <p className="text-sm text-gray-700">
                        This password will be used to access the private list
                      </p>
                    </div>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={!field.state.meta.isValid}
                    />
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          {/* Error alerts */}
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
        </div>

        {/* Form submission */}
        <div>
          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.isPristine,
            ]}
            children={([canSubmit, isPristine]) => (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onFormCancel}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    !canSubmit ||
                    isPristine ||
                    isPending ||
                    list.status === 'archived'
                  }
                >
                  {isPending ? 'Working...' : 'Publish'}
                </Button>
              </div>
            )}
          />
        </div>
      </form>

      {/* Sharing options */}
      <div className="flex flex-col space-y-4 border-t pt-6">
        <Label className="text-md font-bold">Share your unique link</Label>
        {/* Copy link */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex flex-1 items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <LinkIcon className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400" />
            <span className="truncate text-sm text-gray-600">
              {shareableListLink}
            </span>
          </div>
          <Button
            onClick={handleCopy}
            variant="secondary"
            className="rounded-lg border border-gray-200 bg-gray-100 px-6 py-3 text-gray-700 hover:bg-gray-200"
          >
            {copied ? (
              <CheckIcon className="mr-2 h-4 w-4" />
            ) : (
              <CopyIcon className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        {/* Social media sharing */}
        <div className="flex gap-6 pb-2">
          {/* Instagram Button */}
          <button
            onClick={handleInstagramShare}
            className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 py-4 text-white transition-all hover:from-purple-600 hover:via-pink-600 hover:to-orange-500"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.073-1.689-.073-4.849 0-3.204.013-3.583.072-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </button>

          {/* Facebook Button */}
          <button
            onClick={handleFacebookShare}
            className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 py-4 text-white transition-colors hover:bg-blue-700"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          {/* X (Twitter) Button */}
          <button
            onClick={handleTwitterShare}
            className="flex flex-1 items-center justify-center rounded-lg bg-black py-4 text-white transition-colors hover:bg-gray-800"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Unpublish list */}
      <div className="flex flex-col space-y-4 border-t pb-8 pt-6">
        <Label className="text-md font-bold">Unpublish List</Label>
        <p className="text-sm">
          When a list is unpublished, it is no longer accessible online but you
          can still see it in your dashboard. You can publish it at anytime.
        </p>
        <div className="mt-2 flex justify-end">
          <Button
            variant="destructive"
            onClick={handleListStatus}
            disabled={isUnpublishing || list.status === 'draft'}
          >
            {isUnpublishing ? 'Working...' : 'Unpublish'}
          </Button>
        </div>
      </div>
    </div>
  )
}
