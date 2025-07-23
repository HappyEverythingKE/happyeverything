import { hcWithType } from '@server/hc'

export const client = hcWithType('/', {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: 'include',
    }),
}).api
