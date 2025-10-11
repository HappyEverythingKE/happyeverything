import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),
  ],
  // Send structured logs to Sentry
  enableLogs: true,
  // Tracing
  tracesSampleRate: 0.1, //  Capture 10% of the transactions
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
})
