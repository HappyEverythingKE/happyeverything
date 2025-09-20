import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'

import { serveStatic } from '@hono/node-server/serve-static'

import type { ErrorResponse } from '../shared/types'
import { supabaseMiddleware } from './middleware/auth.middleware'
import { authRoutes } from './routes/auth'
import { giftReservationRoutes } from './routes/gift-reservation-routes'
import { listItemRoutes } from './routes/lists/list-item-routes'
import { listRoutes } from './routes/lists/list-routes'
import { profileRoutes } from './routes/profile'
import { publicRoutes } from './routes/public'
import type { UserContext } from './user-context'

const app = new Hono<UserContext>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const apiRoutes = app
  .basePath('/api')
  // middleware
  .use('*', async (c, next) => {
    const origin = c.req.header('origin')
    const allowed = [
      'https://www.myhappyeverything.com',
      'https://happyeverything-frontend.onrender.com',
      'http://localhost:5173',
    ]

    if (origin && allowed.includes(origin)) {
      c.header('Access-Control-Allow-Origin', origin)
    }
    c.header('Access-Control-Allow-Credentials', 'true')
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (c.req.method === 'OPTIONS') {
      return new Response(null, { status: 204 })
    }
    return await next()
  })
  .use('*', logger())
  .use('*', supabaseMiddleware())
  // routes
  .route('/auth', authRoutes)
  .route('/profile', profileRoutes)
  .route('/lists', listRoutes)
  .route('/lists', listItemRoutes)
  .route('/public', publicRoutes)
  .route('/public/reservations', giftReservationRoutes)
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
