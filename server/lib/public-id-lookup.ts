import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { getSupabase } from '@/middleware/auth.middleware'

const listItemIdCache = new Map<string, string>()

/**
 * Resolves a listItem public_id (UUID) to its internal id
 */
export async function resolveListItemIdFromPublicId(
  c: Context,
  itemPublicId: string,
): Promise<string> {
  if (listItemIdCache.has(itemPublicId)) {
    return listItemIdCache.get(itemPublicId)!
  }

  const supabase = getSupabase(c)
  const { data: listItem, error } = await supabase
    .from('list_items')
    .select('id')
    .eq('public_id', itemPublicId)
    .single()

  if (error || !listItem) {
    throw new HTTPException(404, { message: 'List item not found' })
  }

  listItemIdCache.set(itemPublicId, listItem.id)
  return listItem.id
}
