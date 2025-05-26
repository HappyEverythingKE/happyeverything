import { Hono } from 'hono'
import { logger } from 'hono/logger'

import { serve } from '@hono/node-server'

const app = new Hono()

app.use('*', logger())

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)

// graceful shutdown
process.on('SIGINT', () => {
  server.close()
  process.exit(0)
})
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})
