import type { List, ListItem, StatusType } from '@/shared/types'

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

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const mapToListItemType = (item: any): ListItem => {
  return {
    id: item.id,
    listId: item.list_id,
    name: item.name,
    quantity: item.quantity,
    topPick: item.top_pick,
    size: item.size,
    colour: item.colour,
    imageUrl: item.image_url,
    productUrl: item.product_url,
    shopName: item.shop_name,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}
