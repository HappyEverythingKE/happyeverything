import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/auth/auth-confirm')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Card className="mx-4 w-full max-w-md md:px-2 md:py-8">
      <CardHeader className="space-y-4">
        <CardTitle className="text-center text-lg">
          Confirm your email
        </CardTitle>
        <CardDescription className="text-balance text-center text-base">
          Please check your email for a confirmation link and complete your sign
          up.
        </CardDescription>
      </CardHeader>
      <CardFooter className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
        <p className="text-center">Didn&apos;t receive the email?</p>
        <Button asChild variant="link" className="p-0">
          <Link to="/signup">Try again.</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
