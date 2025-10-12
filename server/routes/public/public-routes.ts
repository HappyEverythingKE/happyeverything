import { Hono, type Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import type {
  List,
  ListWithItems,
  PublicListOwner,
  SuccessResponse,
} from '../../../shared/types'
import {
  resolveListIdFromSlug,
  resolveProfileIdFromSlug,
} from '../../lib/slug-id-lookup'
import {
  mapToPublicListType,
  mapToPublicListWithItemsType,
} from '../../lib/utils'
import { getAdminSupabase } from '../../middleware/auth.middleware'

const reservedRoutes = [
  'api',
  'v1',
  'auth',
  'confirm-email',
  'verify',
  'new-password',
  'account',
  'profile',
  'lists',
  'list-types',
  'list-items',
  'reservations',
  'dashboard',
  'login',
  'signup',
  'logout',
  'onboarding',
  'confirm',
  'me',
  'session',
  'contact',
  'about',
  'settings',
  'activity',
]

// view all published lists for a profile
export const publicRoutes = new Hono()
  .get('/:profileSlug', async (c) => {
    const { profileSlug } = c.req.param()

    if (reservedRoutes.includes(profileSlug)) {
      return c.notFound()
    }

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const listOwner = await getPublicListOwner(c, profileId)

    const supabaseAdmin = getAdminSupabase(c)

    const { data: allLists, error } = await supabaseAdmin
      .from('lists')
      .select(
        'name, slug, private, created_at, list_types!inner(id, name, image_url, is_custom)',
      )
      .eq('profile_id', profileId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      throw new HTTPException(500, { message: error.message })
    }

    return c.json<
      SuccessResponse<{
        listOwner: PublicListOwner
        lists: Omit<List, 'password'>[]
      }>
    >({
      success: true,
      data: {
        listOwner: {
          name: listOwner.name,
          avatar: listOwner.avatar,
          profileSlug: listOwner.profile_slug,
          accountCountry: listOwner.account_country,
        },
        lists: allLists.map(mapToPublicListType),
      },
    })
  })
  .get('/:profileSlug/:listSlug', async (c) => {
    const { profileSlug, listSlug } = c.req.param()

    if (reservedRoutes.includes(profileSlug)) {
      return c.notFound()
    }
    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const { list, listOwner } = await getPublicList(c, profileId, listSlug)

    // enforce visibility rules
    if (list.status !== 'published') {
      throw new HTTPException(403, { message: 'List not available' })
    }

    if (list.private) {
      // just return metadata, don’t leak items yet
      return c.json<
        SuccessResponse<{
          listOwner: Pick<PublicListOwner, 'name' | 'profileSlug'>
          privateList: Pick<List, 'name' | 'slug' | 'isPrivate'>
        }>
      >({
        success: true,
        data: {
          listOwner: {
            name: listOwner.name,
            profileSlug: listOwner.profile_slug,
          },
          privateList: {
            name: list.name,
            slug: list.slug,
            isPrivate: list.private,
          },
        },
      })
    }

    // fully public list
    return c.json<
      SuccessResponse<{
        listOwner: PublicListOwner
        list: Omit<ListWithItems, 'password'>
      }>
    >({
      success: true,
      data: {
        listOwner: {
          name: listOwner.name,
          avatar: listOwner.avatar,
          profileSlug: listOwner.profile_slug,
          accountCountry: listOwner.account_country,
        },
        list: mapToPublicListWithItemsType(list),
      },
    })
  })
  .post(
    '/:profileSlug/:listSlug/access',
    zValidator('form', z.object({ password: z.string() })),
    async (c) => {
      const { profileSlug, listSlug } = c.req.param()
      const { password } = c.req.valid('form')

      if (reservedRoutes.includes(profileSlug)) {
        return c.notFound()
      }

      const profileId = await resolveProfileIdFromSlug(c, profileSlug)
      const { list } = await getPublicList(c, profileId, listSlug)

      if (list.status !== 'published') {
        throw new HTTPException(403, { message: 'List not available' })
      }

      if (!list.private || !list.password) {
        throw new HTTPException(400, {
          message: 'This list does not require a password',
        })
      }

      if (list.password !== password) {
        throw new HTTPException(401, { message: 'Incorrect password' })
      }

      return c.json<SuccessResponse<Omit<ListWithItems, 'password'>>>({
        success: true,
        data: mapToPublicListWithItemsType(list),
      })
    },
  )

async function getPublicListOwner(c: Context, profileId: string) {
  const supabaseAdmin = getAdminSupabase(c)

  // pull public profile data using supabaseAdmin to bypass RLS
  const { data: listOwner, error: listOwnerError } = await supabaseAdmin
    .from('accounts_public_by_profile')
    .select('name, avatar, profile_slug, account_country')
    .eq('profile_id', profileId)
    .maybeSingle()

  if (!listOwner || listOwnerError) {
    throw new HTTPException(500, { message: listOwnerError?.message })
  }

  return listOwner
}

async function getPublicList(c: Context, profileId: string, listSlug: string) {
  const listId = await resolveListIdFromSlug(c, profileId, listSlug)
  const listOwner = await getPublicListOwner(c, profileId)

  const supabaseAdmin = getAdminSupabase(c)

  // pull public list data
  const { data: listMeta, error: listError } = await supabaseAdmin
    .from('lists')
    .select(
      `
        name, slug, description, private, password, status, created_at, updated_at,
        list_types!inner(id, name, image_url, is_custom)
      `,
    )
    .eq('id', listId)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (listError || !listMeta) {
    throw new HTTPException(404, { message: 'List not found' })
  }

  // fetch items from view
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('public_list_items_with_counts')
    .select('*')
    .eq('list_id', listId)
    .order('still_needs', { ascending: false })
    .order('top_pick', { ascending: false })
    .order('created_at', { ascending: false })

  if (itemsError) {
    throw new HTTPException(500, { message: 'Failed to fetch list items' })
  }

  const list = {
    ...listMeta,
    items,
  }

  return { list, listOwner }
}
