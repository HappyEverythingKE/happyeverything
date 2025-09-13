/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  List,
  ListItem,
  ListStatusType,
  ListWithItems,
} from '@/shared/types'

/**
 * Formats a date string to "day month (short) year" format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "15 Jan 2024")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const mapToListType = (list: any): List => {
  return {
    name: list.name,
    slug: list.slug,
    description: list.description,
    isPrivate: list.private,
    password: list.password,
    status: list.status as ListStatusType,
    createdAt: formatDate(list.created_at),
    updatedAt: list.updated_at ? formatDate(list.updated_at) : undefined,
    listType: {
      id: list.list_types.id,
      name: list.list_types.name,
      imageUrl: list.list_types.image_url,
      isCustom: list.list_types.is_custom,
    },
  }
}

export const mapToListItemType = (item: any): ListItem => {
  return {
    publicId: item.public_id,
    name: item.name,
    quantity: item.quantity,
    topPick: item.top_pick,
    size: item.size,
    colour: item.colour,
    imageUrl: item.image_url,
    productUrl: item.product_url,
    shopName: item.shop_name,
    reservedCount: item.reserved_count,
    gifters: item.gifters,
    stillNeeds: item.still_needs,
    createdAt: formatDate(item.created_at),
    updatedAt: item.updated_at ? formatDate(item.updated_at) : undefined,
  }
}

export const mapToPublicListType = (list: any): Omit<List, 'password'> => {
  return {
    name: list.name,
    slug: list.slug,
    description: list.description,
    isPrivate: list.private,
    status: list.status as ListStatusType,
    createdAt: formatDate(list.created_at),
    updatedAt: list.updated_at ? formatDate(list.updated_at) : undefined,
    listType: {
      id: list.list_types.id,
      name: list.list_types.name,
      imageUrl: list.list_types.image_url,
      isCustom: list.list_types.is_custom,
    },
  }
}

export const mapToPublicListWithItemsType = (
  list: any,
): Omit<ListWithItems, 'password'> => {
  return {
    ...mapToPublicListType(list),
    items: list.items.map(mapToListItemType),
  }
}
