import { hc } from 'hono/client'

import { type ApiRoutes } from '@shared/types'

export const client = hc<ApiRoutes>('/', {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: 'include',
    }),
}).api
