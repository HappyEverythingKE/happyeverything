import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import BalloonImage from '@/assets/images/woman-with-balloons.png'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { ContactFormSchema } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { FieldInfo } from '@/components/field-info'

export const Route = createFileRoute('/_marketing/contact')({
  component: RouteComponent,
})

const defaultValues = {
  fullName: '',
  email: '',
  message: '',
  termsChecked: false,
} as z.infer<typeof ContactFormSchema>

function RouteComponent() {
  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: ContactFormSchema },
    onSubmit: async ({ value }) => {
      console.log(value)
      toast.success('Your message is on its way to us!')
      form.reset()
    },
    // use emailjs to send the email to team
    // onSubmit: async ({ value: data, formApi }) => {
    //   // replace with form submission to email service
    //   const response = await fetch('/api/users', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    //   })

    //   if (response.ok) {
    //     // show success toast
    //     console.log(await response.json())
    //     toast('Thank you')
    //     form.reset()
    //   } else {
    //     const errors = await response.json()

    //     //either set error on individual fiels or see if the global one works
    //     formApi.fieldInfo.fullName.instance?.setErrorMap({
    //       onSubmit: errors.fullName,
    //     })
    //     formApi.fieldInfo.email.instance?.setErrorMap({
    //       onSubmit: errors.email,
    //     })
    //     formApi.fieldInfo.message.instance?.setErrorMap({
    //       onSubmit: errors.message,
    //     })
    //     formApi.fieldInfo.termsChecked.instance?.setErrorMap({
    //       onSubmit: errors.termsChecked,
    //     })
    //     formApi.setErrorMap({
    //       onSubmit: errors,
    //     })
    //   }
    // },
  })

  return (
    <section id="contact" className="px-[5%] py-16">
      <div className="container grid grid-cols-1 gap-y-12 md:gap-x-12 lg:grid-flow-row lg:grid-cols-2 lg:gap-x-20">
        <div>
          <div className="mb-8">
            <h1 className="mb-3 text-2xl md:text-3xl">Contact us</h1>
            <p>
              Do you have a question or feedback to share with us? <br />
              Send it in using the form below and we’ll get back to you.
            </p>
          </div>

          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <div className="grid gap-2">
              <form.Field
                name="fullName"
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
                        aria-invalid={
                          !field.state.meta.isValid &&
                          field.state.meta.isTouched
                        }
                        placeholder="Enter your name"
                      />
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
                        aria-invalid={
                          !field.state.meta.isValid &&
                          field.state.meta.isTouched
                        }
                        placeholder="Enter your email"
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
                name="message"
                children={(field) => {
                  return (
                    <>
                      <Label htmlFor={field.name}>Message</Label>
                      <Textarea
                        id={field.name}
                        className="min-h-[11.25rem] overflow-auto"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={
                          !field.state.meta.isValid &&
                          field.state.meta.isTouched
                        }
                        placeholder="Enter your message..."
                      />
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
            </div>

            <div className="grid gap-2">
              <form.Field
                name="termsChecked"
                children={(field) => {
                  return (
                    <>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.setValue(true)
                              : field.setValue(false)
                          }}
                          checked={field.state.value}
                        />
                        <div className="flex flex-col space-y-1">
                          <Label
                            htmlFor="termsChecked"
                            className="font-normal leading-5"
                          >
                            By submitting this form, I consent to receiving
                            communications from Happy Everything.
                          </Label>

                          <p className="text-muted-foreground text-xs">
                            For more information, please review our{' '}
                            <span>
                              <Link
                                to="/"
                                className="hover:underline hover:underline-offset-4"
                              >
                                Privacy Policy
                              </Link>
                            </span>
                            .
                          </p>
                        </div>
                      </div>
                      <FieldInfo field={field} />
                    </>
                  )
                }}
              />
            </div>

            {/* Form global error handling */}
            <div>
              <form.Subscribe
                selector={(state) => [state.errorMap]}
                children={([errorMap]) =>
                  errorMap.onSubmit ? (
                    <div>
                      <Alert variant={'destructive'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>An error has occured!</AlertTitle>
                        <AlertDescription>{errorMap.onSubmit}</AlertDescription>
                      </Alert>
                    </div>
                  ) : null
                }
              />
            </div>

            {/* Form submit */}
            <div className="-mt-4">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Spinner /> Submitting...
                      </span>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                )}
              />
            </div>
          </form>
        </div>

        <div className="grid w-full">
          <img
            src={BalloonImage}
            alt="Woman with balloons"
            className="rounded-2xl object-cover object-top xl:aspect-square"
            width="896"
            height="1042"
          />
        </div>
      </div>
    </section>
  )
}
