import type { List, StatusType } from '@/shared/types'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const mapToListType = (list: any): List => {
  return {
    name: list.name,
    slug: list.slug,
    listType: list.list_type,
    description: list.description,
    isPrivate: list.private,
    password: list.password,
    status: list.status as StatusType,
    createdAt: list.created_at,
  }
}
