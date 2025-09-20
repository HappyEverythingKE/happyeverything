import { hcWithType } from '@server/hc'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/'

export const client = hcWithType(API_BASE_URL, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: 'include',
    }),
}).v1
