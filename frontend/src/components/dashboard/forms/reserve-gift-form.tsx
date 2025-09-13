import { useForm } from '@tanstack/react-form'

import { useReserveGift } from '@/services/gift-reservation.api'
import { GiftReservationCreateSchema } from '@shared/types'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldInfo } from '@/components/field-info'

interface ReserveGiftFormProps {
  listSlug: string
  profileSlug: string
  itemReservationInfo: {
    itemPublicId: string
    itemQuantity: number
    stillNeeds: number
  }
  onFormSubmit: () => void
  onFormCancel: () => void
}

const defaultValues = {
  gifterName: '',
  quantityReserved: 1,
} as z.infer<typeof GiftReservationCreateSchema>

export function ReserveGiftForm({
  profileSlug,
  listSlug,
  itemReservationInfo,
  onFormSubmit,
  onFormCancel,
}: ReserveGiftFormProps) {
  const { mutateAsync: reserveGift, isPending } = useReserveGift(
    profileSlug,
    listSlug,
  )

  const form = useForm({
    defaultValues: defaultValues,
    validators: { onChange: GiftReservationCreateSchema },
    onSubmit: async ({ value }) => {
      const res = await reserveGift({
        itemPublicId: itemReservationInfo.itemPublicId,
        reservationData: value,
      })
      if (res.success) {
        toast.success('Gift Reserved.')
        onFormSubmit()
      } else {
        toast.error('An error occurred', { description: res.error })
        if (res.isFormError) {
          form.setErrorMap({
            // @ts-expect-error error is a string but onSubmit expects an object mapping to the fields
            onSubmit: res.error || 'Unexpected error',
          })
        }
      }
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-gray-700">
          Submitting this form won&apos;t place an order or make a purchase, it
          simply crosses the item off this wish list so no one else picks it
          too.
        </p>
        <p className="text-gray-700">
          Don&apos;t forget to get the gift in time for their celebration!
        </p>
      </div>

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
              name="gifterName"
              children={(field) => {
                return (
                  <>
                    <div className="flex flex-col space-y-1">
                      <Label
                        className="text-md font-semibold"
                        htmlFor={field.name}
                      >
                        Your name (optional)
                      </Label>
                      <p className="text-sm text-gray-700">
                        Only the list owner will see your name. It won&apos;t be
                        visible to anyone else.
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
                      placeholder="Your name"
                      maxLength={50}
                    />
                    <p className="-mt-1 text-xs text-gray-500">
                      {field.state.value ? field.state.value.length : 0}/50
                      characters
                    </p>
                    <FieldInfo field={field} />
                  </>
                )
              }}
            />
          </div>

          <div className="space-y-4">
            <form.Field
              name="quantityReserved"
              children={(field) => {
                return (
                  <>
                    <div className="flex flex-col space-y-1">
                      <Label
                        className="text-md font-semibold"
                        htmlFor={field.name}
                      >
                        Quantity reserved
                      </Label>
                      <p className="text-sm text-gray-700">
                        How many of this gift are you reserving?
                      </p>
                    </div>
                    <Input
                      type="number"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      min={1}
                      max={itemReservationInfo.stillNeeds}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      aria-invalid={!field.state.meta.isValid}
                    />
                    <p className="-mt-1 text-xs text-gray-500">
                      Reserving: {field.state.value ? field.state.value : 0}/
                      {itemReservationInfo.stillNeeds}
                    </p>
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
                    itemReservationInfo.stillNeeds === 0
                  }
                >
                  {isPending ? 'Working...' : 'Cross it off their list!'}
                </Button>
              </div>
            )}
          />
        </div>
      </form>
    </div>
  )
}
