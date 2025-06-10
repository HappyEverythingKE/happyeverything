import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'

import { authRoutes } from '@/routes/auth'
import { serveStatic } from '@hono/node-server/serve-static'

import type { ErrorResponse } from '@/shared/types'

const app = new Hono()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const apiRoutes = app
  .basePath('/api')
  // middleware
  .use('*', logger())
  // routes
  .route('/auth', authRoutes)

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

export default app
export type ApiRoutes = typeof apiRoutes
