import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import {
  getAdminSupabase,
  getSupabase,
  getUserSession,
} from '@/middleware/auth.middleware'
import { zValidator } from '@hono/zod-validator'

import {
  AccountSchema,
  type Account,
  type SuccessResponse,
} from '@/shared/types'

export const accountManagementRoutes = new Hono()
  .get('/', getUserSession, async (c) => {
    const user = c.get('user')!
    const supabase = getSupabase(c)

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
  })
  .patch('/', getUserSession, zValidator('form', AccountSchema), async (c) => {
    const user = c.get('user')!
    const { name, email, country, avatar } = c.req.valid('form')

    const supabase = getSupabase(c)

    // update auth.users email using the Admin API
    const { data: authUser, error: authError } =
      await supabase.auth.admin.updateUserById(user.id, { email })

    console.log('BE authUser', authUser)

    if (authError) {
      throw new HTTPException(500, {
        message: `Auth update failed: ${authError.message}`,
      })
    }

    // update accounts table
    const { data, error } = await supabase
      .from('accounts')
      .update({ name, email, country, avatar })
      .eq('id', user.id)
      .select(
        'email, name, status, avatar, country, created_at, profiles!inner(slug, status, lists!inner(name, slug))',
      )
      .single()

    console.log('BE data', data)
    console.log('BE error', error)

    if (error) {
      throw new HTTPException(500, {
        message: error.message,
      })
    }

    return c.json<SuccessResponse<Account>>({
      success: true,
      data: {
        ...data,
        createdAt: data.created_at,
      },
    })
  })
  .delete('/', getUserSession, async (c) => {
    const user = c.get('user')!
    const supabase = getSupabase(c)
    const supabaseAdmin = getAdminSupabase(c)

    const { error: accountError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', user.id)

    if (accountError) {
      throw new HTTPException(500, {
        message: accountError.message,
      })
    }

    // delete from Supabase Auth
    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id,
    )
    if (userError) {
      throw new HTTPException(500, { message: userError.message })
    }

    return c.body(null, 204)
  })
