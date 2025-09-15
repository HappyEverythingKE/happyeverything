import { Suspense, type ReactNode } from 'react'

import { ErrorBoundary } from 'react-error-boundary'

import { ErrorComponent } from '@/components/error-component'

/**
 * Wraps a section of UI that uses useSuspenseQuery.
 * - Shows a Suspense fallback while loading
 * - Shows ErrorComponent on error
 * - Supports inline (section) or full-page (route) display
 */
export function SuspenseQueryBoundary({
  children,
  fallback,
  inline = true,
}: {
  children: ReactNode
  fallback: ReactNode
  inline?: boolean
}) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorComponent
          error={error}
          inline={inline}
          onRetry={resetErrorBoundary}
        />
      )}
    >
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}
