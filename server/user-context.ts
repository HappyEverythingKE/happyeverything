import type { Env } from 'hono'

import type { Session, User } from '@supabase/supabase-js'

export interface UserContext extends Env {
  Variables: {
    user: User | null
    session: Session | null
  }
}
