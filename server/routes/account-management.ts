import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { getSupabase, getUserSession } from '@/middleware/auth.middleware'

import { type Account, type SuccessResponse } from '@/shared/types'

export const accountManagementRoutes = new Hono().get(
  '/',
  getUserSession,
  async (c) => {
    const user = c.get('user')!
    const supabase = getSupabase(c)
    // console.log('user', user)

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select(
        'email, name, status, avatar, country, created_at, profiles!inner(slug, status, lists!inner(name, slug))',
      )
      .eq('id', user.id)
      .single()

    if (accountError) {
      throw new HTTPException(500, {
        message: accountError.message,
      })
    }

    return c.json<SuccessResponse<Account>>({
      success: true,
      data: {
        ...account,
        createdAt: account.created_at,
      },
    })
  },
)
