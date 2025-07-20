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
    })

    return () => subscription?.unsubscribe()
  }, [queryClient])
}
