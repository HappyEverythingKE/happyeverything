import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'

import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { z } from 'zod'

import type { ErrorResponse } from '@/shared/types'

const app = new Hono()

if (process.env['NODE_ENV'] !== 'production') {
  app.use('*', logger())
}

app.get('/api', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.onError((err, c) => {
  // handle expected errors
  if (err instanceof HTTPException) {
    const errResponse =
      err.res ??
      c.json<ErrorResponse>(
        {
          success: false,
          error: err.message,
          isFormError:
            err.cause && typeof err.cause === 'object' && 'form' in err.cause
              ? err.cause.form === true
              : false,
        },
        err.status,
      )
    return errResponse
  }

  return c.json<ErrorResponse>(
    // handle unexpected errors
    {
      success: false,
      error:
        process.env['NODE_ENV'] === 'production'
          ? 'Internal Server Error'
          : (err.stack ?? err.message),
    },
    500,
  )
})

app.get('*', serveStatic({ root: './frontend/dist' }))
app.get('*', serveStatic({ path: './frontend/dist/index.html' }))

// Server config
const ServeEnv = z.object({
  PORT: z
    .string()
    .regex(/^\d+$/, 'Port must be a numeric string')
    .default('3000')
    .transform(Number),
})

const ProcessEnv = ServeEnv.parse(process.env)

const server = serve(
  {
    fetch: app.fetch,
    hostname: '0.0.0.0',
    port: ProcessEnv.PORT,
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
