import './instrument.mjs'

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'

import { serveStatic } from '@hono/node-server/serve-static'
import * as Sentry from '@sentry/node'

import type { ErrorResponse } from '../shared/types'
import { supabaseMiddleware } from './middleware/auth.middleware'
import { accountRoutes } from './routes/account'
import { authRoutes } from './routes/auth'
import { listItemRoutes } from './routes/lists/list-item-routes'
import { listRoutes } from './routes/lists/list-routes'
import { profileRoutes } from './routes/profile'
import { giftReservationRoutes } from './routes/public/gift-reservation-routes'
import { publicRoutes } from './routes/public/public-routes'
import type { UserContext } from './user-context'

const app = new Hono<UserContext>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const apiRoutes = app
  .basePath('/v1')
  // middleware
  .use(
    '*',
    cors({
      origin: ['http://localhost:5173', 'https://www.myhappyeverything.com'],
      credentials: true,
    }),
  )
  .use('*', logger())
  .use('*', supabaseMiddleware())
  .use((c, next) => {
    // Only set user context if user exists
    const user = c.get('user')!
    if (user?.email) {
      Sentry.setUser({
        email: user.email,
      })
    }

    return next()
  })
  // routes
  .route('/auth', authRoutes)
  .route('/account', accountRoutes)
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

  // report only unexpected errors.
  Sentry.captureException(err)
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

app.get('/debug-sentry', () => {
  // Send a log before throwing the error
  Sentry.logger.info('User triggered test error', {
    action: 'test_error_endpoint',
  })
  throw new Error('My first Sentry error!')
})

app.get('*', serveStatic({ root: './frontend/dist' }))
app.get('*', serveStatic({ path: './frontend/dist/index.html' }))

export default app
export type ApiRoutes = typeof apiRoutes
