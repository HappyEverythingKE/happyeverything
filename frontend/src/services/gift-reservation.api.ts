import { useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  ErrorResponse,
  GiftReservationType,
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'

export const createReservation = async (
  itemPublicId: string,
  reservationData: Partial<GiftReservationType>,
) => {
  try {
    const res = await client.reservations[itemPublicId].$post({
      form: reservationData,
    })

    if (res.ok) {
      const data = (await res.json()) as SuccessResponse<GiftReservationType>
      return data
    }

    const data = (await res.json()) as unknown as ErrorResponse
    return data
  } catch (error) {
    return {
      success: false,
      error: String(error),
      isFormError: false,
    } as ErrorResponse
  }
}

export const useCreateReservation = (
  itemPublicId: string,
  profileSlug: string,
  listSlug: string,
) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (reservationData: Partial<GiftReservationType>) =>
      createReservation(itemPublicId, reservationData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [profileSlug, listSlug, 'items'],
      })
      router.invalidate()
    },
  })
}
