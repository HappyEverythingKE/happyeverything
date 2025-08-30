import { hc } from 'hono/client'

import type { ApiRoutes } from './app'

// this is a trick to calculate the type when compiling: https://hono.dev/docs/guides/rpc#compile-your-code-before-using-it-recommended

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = hc<ApiRoutes>('')
export type Client = typeof client

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<ApiRoutes>(...args)
