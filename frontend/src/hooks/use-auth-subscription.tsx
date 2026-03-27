import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { sessionQueryOptions } from '@/services/auth.api'

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

  // Re-validate the session whenever the user returns to the tab.
  // This is the primary guard against stale cookies after long idle periods —
  // hitting /session server-side triggers getUser(), which refreshes the
  // httpOnly cookie if it's close to expiry.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [queryClient])
}
