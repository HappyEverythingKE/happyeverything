import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { zValidator } from '@hono/zod-validator'

import {
  AccountSchema,
  type Account,
  type SuccessResponse,
} from '../../shared/types'
import {
  getAdminSupabase,
  getSupabase,
  getUserSession,
} from '../middleware/auth.middleware'

export const accountRoutes = new Hono()
  .get('/', getUserSession, async (c) => {
    const user = c.get('user')!
    const supabase = getSupabase(c)

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select(
        'email, name, status, avatar_id, country, created_at, profiles(slug, status, created_at, lists(name, slug))',
      )
      .order('created_at', { referencedTable: 'profiles', ascending: false })
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
        avatarId: account.avatar_id,
        createdAt: account.created_at,
      },
    })
  })
  .patch('/', getUserSession, zValidator('form', AccountSchema), async (c) => {
    const user = c.get('user')!
    const { name, country, avatarId } = c.req.valid('form')
    const supabase = getSupabase(c)

    // update accounts table
    const updateData: {
      name: string
      country: string
      avatar_id?: string | null
    } = {
      name,
      country,
    }
    if (avatarId !== 'undefined') {
      updateData.avatar_id = avatarId
    } else {
      updateData.avatar_id = null
    }

    const { data, error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', user.id)
      .select(
        'email, name, status, avatar_id, country, created_at, profiles(slug, status, created_at, lists(name, slug))',
      )
      .order('created_at', { referencedTable: 'profiles', ascending: false })
      .single()

    if (error) {
      throw new HTTPException(500, {
        message: error.message,
      })
    }

    return c.json<SuccessResponse<Account>>({
      success: true,
      data: {
        ...data,
        avatarId: data.avatar_id,
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
