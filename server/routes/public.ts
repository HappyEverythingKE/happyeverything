import { Hono, type Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { getSupabase } from '@/middleware/auth.middleware'

import type {
  List,
  ListWithItems,
  PublicListOwner,
  SuccessResponse,
} from '@/shared/types'
import {
  resolveListIdFromSlug,
  resolveProfileIdFromSlug,
} from '@/lib/slug-id-lookup'
import { mapToListType, mapToListWithItemsType } from '@/lib/utils'

const reservedRoutes = [
  'api',
  'auth',
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
  'auth-confirm',
  'confirm',
  'me',
  'session',
  'contact',
  'about',
  'settings',
]

// view all published lists for a profile
export const publicRoutes = new Hono()
  .get('/:profileSlug', async (c) => {
    const { profileSlug } = c.req.param()
    console.log('Public endpoint get all profileSlug??', profileSlug)

    if (reservedRoutes.includes(profileSlug)) {
      console.log('Reserved route found in get all', profileSlug)
      return c.notFound()
    }

    const profileId = await resolveProfileIdFromSlug(c, profileSlug)
    const supabase = getSupabase(c)

    const listOwner = await getPublicListOwner(c, profileSlug)

    const { data: allLists, error } = await supabase
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
        lists: List[]
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
        lists: allLists.map(mapToListType),
      },
    })
  })
  .get('/:profileSlug/:listSlug', async (c) => {
    const { profileSlug, listSlug } = c.req.param()
    console.log('reservedRoutes', reservedRoutes)

    if (reservedRoutes.includes(profileSlug)) {
      console.log('Reserved route found', profileSlug)
      return c.notFound()
    }

    const { list, listOwner } = await getPublicList(c, profileSlug, listSlug)

    // enforce visibility rules
    if (list.status !== 'published') {
      throw new HTTPException(403, { message: 'List not available' })
    }

    if (list.private) {
      // just return metadata, don’t leak items yet
      return c.json<SuccessResponse<Pick<List, 'name' | 'slug' | 'isPrivate'>>>(
        {
          success: true,
          data: { name: list.name, slug: list.slug, isPrivate: list.private },
        },
      )
    }

    // fully public list
    return c.json<
      SuccessResponse<{
        listOwner: PublicListOwner
        list: ListWithItems
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
        list: mapToListWithItemsType(list),
      },
    })
  })
  .post('/:profileSlug/:listSlug/access', async (c) => {
    const { profileSlug, listSlug } = c.req.param()
    const { password } = await c.req.json<{ password: string }>()

    if (reservedRoutes.includes(profileSlug)) {
      return c.notFound()
    }

    const { list } = await getPublicList(c, profileSlug, listSlug)

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

    return c.json<SuccessResponse<ListWithItems>>({
      success: true,
      data: mapToListWithItemsType(list),
    })
  })

async function getPublicListOwner(c: Context, profileSlug: string) {
  const profileId = await resolveProfileIdFromSlug(c, profileSlug)
  const supabase = getSupabase(c)

  const { data: listOwner, error: listOwnerError } = await supabase
    .from('accounts_public_by_profile')
    .select('name, avatar, profile_slug, account_country')
    .eq('profile_id', profileId)
    .single()

  if (!listOwner || listOwnerError) {
    throw new HTTPException(500, { message: listOwnerError?.message })
  }

  return listOwner
}

async function getPublicList(
  c: Context,
  profileSlug: string,
  listSlug: string,
) {
  const profileId = await resolveProfileIdFromSlug(c, profileSlug)
  const listId = await resolveListIdFromSlug(c, profileId, listSlug)
  const supabase = getSupabase(c)

  const listOwner = await getPublicListOwner(c, profileSlug)

  const { data: list, error } = await supabase
    .from('lists')
    .select(
      `
        name, slug, description, private, password, status, created_at, updated_at,
        list_types!inner(id, name, image_url, is_custom),
        list_items (
          public_id, name, quantity, size, colour, image_url, product_url, shop_name, top_pick, created_at, updated_at
        )
      `,
    )
    .eq('id', listId)
    .eq('profile_id', profileId)
    .order('top_pick', { referencedTable: 'list_items', ascending: false })
    .order('created_at', { referencedTable: 'list_items', ascending: false })
    .maybeSingle()

  if (error || !list) {
    throw new HTTPException(404, { message: 'List not found' })
  }

  return { list, listOwner }
}
