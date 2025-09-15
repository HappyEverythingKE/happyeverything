import { useEffect } from 'react'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'

import { AlertTriangleIcon } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function ErrorComponent({
  error,
  inline = false,
  onRetry, // optional local retry handler
}: {
  error?: Error
  inline?: boolean
  onRetry?: () => void
}) {
  const router = useRouter()
  const navigate = useNavigate()
  const isDev = process.env.NODE_ENV !== 'production'

  const queryClientErrorBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    // Reset query error boundary whenever component mounts
    queryClientErrorBoundary.reset()
  }, [queryClientErrorBoundary])

  const tryAgain = () => {
    if (onRetry) {
      // local error boundary retry
      onRetry()
    } else {
      // global error recovery: invalidate route & reload page
      router.invalidate()
      navigate({
        to: '.',
        search: () => ({}),
      })
    }
  }

  return (
    <div
      className={
        inline ? 'w-full p-4' : 'mt-8 flex items-center justify-center p-4'
      }
    >
      <div className={inline ? 'w-full' : 'w-full max-w-md'}>
        <Alert variant="destructive">
          <AlertTriangleIcon className="size-4" />
          <AlertTitle>Oops! Something went wrong</AlertTitle>
          <AlertDescription>
            We&apos;re sorry, but we encountered an unexpected error.
            <br />
            Details: {error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>

        <div className="mt-4 space-y-4">
          <Button className="w-full" onClick={tryAgain}>
            Try again
          </Button>

          {!inline && (
            <Button asChild className="w-full" variant="outline">
              <Link to="/dashboard">Return to dashboard</Link>
            </Button>
          )}

          {isDev && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="error-details">
                <AccordionTrigger>View error details</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-muted rounded-md p-4">
                    <h3 className="mb-2 font-semibold">Error Message:</h3>
                    <p className="mb-4 text-sm">
                      {error?.message || 'Unknown error'}
                    </p>
                    <h3 className="mb-2 font-semibold">Stack Trace:</h3>
                    <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
                      {error?.stack || 'Unknown error'}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>
    </div>
  )
}
