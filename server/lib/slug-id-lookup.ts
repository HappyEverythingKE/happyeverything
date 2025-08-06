import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { getSupabase } from '@/middleware/auth.middleware'

const profileIdCache = new Map<string, string>()
const listIdCache = new Map<string, string>()

/**
 * Resolves a profileSlug to its profileId, with basic in-memory caching.
 * This works for single-instance dev or lightweight production.
 * If ever using multiple serverless functions or multiple instances, consider a distributed cache like Redis.
 */
export async function resolveProfileIdFromSlug(
  c: Context,
  slug: string,
): Promise<string> {
  // Return from cache if available
  if (profileIdCache.has(slug)) {
    return profileIdCache.get(slug)!
  }

  const supabase = getSupabase(c)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('slug', slug)
    .single()

  if (error || !profile) {
    throw new HTTPException(404, {
      message: 'Profile not found',
    })
  }

  // Cache the result
  profileIdCache.set(slug, profile.id)

  return profile.id
}

// Resolves a listSlug to its listId
export async function resolveListIdFromSlug(
  c: Context,
  profileId: string,
  listSlug: string,
): Promise<string> {
  const cacheKey = `${profileId}:${listSlug}`
  if (listIdCache.has(cacheKey)) {
    return listIdCache.get(cacheKey)!
  }

  const supabase = getSupabase(c)
  const { data: list, error } = await supabase
    .from('lists')
    .select('id')
    .eq('profile_id', profileId)
    .eq('slug', listSlug)
    .single()

  if (error || !list) {
    throw new HTTPException(404, {
      message: 'List not found',
    })
  }

  listIdCache.set(cacheKey, list.id)
  return list.id
}
