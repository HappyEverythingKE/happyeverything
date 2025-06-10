import 'dotenv/config'

import app from '@/app'
import { serve } from '@hono/node-server'

// server config
const server = serve(
  {
    fetch: app.fetch,
    hostname: '0.0.0.0',
    port: Number(process.env['PORT'] || 3000),
  },
  (info) => {
    console.log(`Server is running on port: ${info.port}`)
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
