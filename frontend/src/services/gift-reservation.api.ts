import { useMutation, useQueryClient } from '@tanstack/react-query'

import type {
  ErrorResponse,
  GiftReservation,
  ListItem,
  ListWithItems,
  PublicListOwner,
  ReserveGiftResponse,
  SuccessResponse,
} from '@shared/types'

import { client } from '@/lib/api'

export const reserveGift = async (
  itemPublicId: string,
  reservationData: Partial<GiftReservation>,
) => {
  const res = await (client.public.reservations as any)[itemPublicId].$post({
    form: reservationData,
  })

  if (res.ok) {
    const data = (await res.json()) as SuccessResponse<ReserveGiftResponse>
    return data
  }

  const data = (await res.json()) as unknown as ErrorResponse
  return data
}

export const useReserveGift = (profileSlug: string, listSlug: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      itemPublicId,
      reservationData,
    }: {
      itemPublicId: string
      reservationData: Partial<GiftReservation>
    }) => reserveGift(itemPublicId, reservationData),

    onSuccess: async (res) => {
      if (!res.success) return

      const { publicId, stillNeeds } = res.data.item

      // --- Optimistically update cached list data ---
      const updateList = (oldData?: {
        list: ListWithItems
        listOwner: PublicListOwner
      }) => {
        if (!oldData || !oldData.list || !Array.isArray(oldData.list.items))
          return oldData

        return {
          ...oldData,
          list: {
            ...oldData.list,
            items: oldData.list.items.map((item: ListItem) =>
              item.publicId === publicId ? { ...item, stillNeeds } : item,
            ),
          },
        }
      }

      queryClient.setQueryData(
        ['unlockedList', profileSlug, listSlug],
        updateList,
      )

      queryClient.setQueryData(
        ['publicListMeta', profileSlug, listSlug],
        updateList,
      )

      // --- Invalidate to reconcile with the server in background ---
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['unlockedList', profileSlug, listSlug],
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: ['publicListMeta', profileSlug, listSlug],
          refetchType: 'active',
        }),
      ])
    },
  })
}
