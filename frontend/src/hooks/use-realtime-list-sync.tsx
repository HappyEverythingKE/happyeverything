import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

/**
 * Syncs public wishlist UI when reservations or list items change.
 * - Triggers when someone reserves a gift (gift_reservations)
 * - Triggers when the list owner edits a list item (list_items)
 */
export function useRealtimeListSync(
  profileSlug: string,
  listSlug: string,
  listId?: string,
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!listId) return

    // Listen to gift reservations for this list
    const reservationsChannel = supabase
      .channel(`gift_reservations:${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // insert, update, delete
          schema: 'public',
          table: 'gift_reservations',
          filter: `list_public_id=eq.${listId}`,
        },
        (payload) => {
          console.log('Gift reservation change:', payload)
          queryClient.invalidateQueries({
            queryKey: ['unlockedList', profileSlug, listSlug],
          })
          queryClient.invalidateQueries({
            queryKey: ['publicListMeta', profileSlug, listSlug],
          })
        },
      )
      .subscribe()

    // Listen to direct list item updates for this list
    const itemsChannel = supabase
      .channel(`list_items:${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_items',
          filter: `list_public_id=eq.${listId}`,
        },
        (payload) => {
          console.log('List item change:', payload)
          queryClient.invalidateQueries({
            queryKey: ['profiles', profileSlug, 'lists', listSlug],
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(reservationsChannel)
      supabase.removeChannel(itemsChannel)
    }
  }, [listId, queryClient])
}
