import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'

export function useAuthSubscription() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        queryClient.removeQueries({ queryKey: ['session', 'current-user'] })
        window.location.href = '/login'
      }

      // When the token is refreshed, invalidate the session query so the
      // server-side cookie gets updated on the next check
      if (event === 'TOKEN_REFRESHED') {
        queryClient.invalidateQueries({ queryKey: ['session'] })
      }
    })

    return () => subscription?.unsubscribe()
  }, [queryClient])
}
