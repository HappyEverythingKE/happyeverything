import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'

import { supabaseMiddleware } from '@/middleware/auth.middleware'
import { authRoutes } from '@/routes/auth'
import { listsRoutes } from '@/routes/lists/lists-routes'
import { profileRoutes } from '@/routes/profile'
import type { UserContext } from '@/user-context'
import { serveStatic } from '@hono/node-server/serve-static'

import type { ErrorResponse } from '@/shared/types'

const app = new Hono<UserContext>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const apiRoutes = app
  .basePath('/api')
  // middleware
  .use('*', logger())
  .use('*', cors())
  .use('*', supabaseMiddleware())
  // routes
  .route('/auth', authRoutes)
  .route('/profile', profileRoutes)
  .route('/lists', listsRoutes)
// .route('/lists', listItemsRoutes)
// .route('/lists', listAccessRoutes)

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
