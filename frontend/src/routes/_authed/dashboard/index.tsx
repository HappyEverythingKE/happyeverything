import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { allProfilesQueryOptions } from '@/services/profile.api'
import type { Profile } from '@shared/types'
import { startCase } from 'lodash'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ProfileCardSkeleton from '@/components/ui/profile-card-skeleton'
import { SuspenseQueryBoundary } from '@/components/suspense-query-boundary'

export const Route = createFileRoute('/_authed/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="relative overflow-hidden">
      {/* blurred background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
        {/* simulated blurred content elements */}
        <div className="absolute left-8 top-8 h-16 w-16 rounded-full bg-orange-200 opacity-60 blur-md" />
        <div className="absolute right-24 top-12 h-4 w-32 rounded bg-gray-400 opacity-40 blur-sm" />
        <div className="absolute left-16 top-32 h-4 w-24 rounded bg-gray-500 opacity-30 blur-sm" />
        <div className="absolute right-32 top-48 h-20 w-20 rounded-full bg-orange-300 opacity-50 blur-lg" />
        <div className="absolute bottom-32 left-12 h-6 w-28 rounded bg-gray-400 opacity-35 blur-sm" />
        <div className="absolute bottom-16 right-16 h-12 w-12 rounded-full bg-red-200 opacity-45 blur-md" />
        <div className="absolute bottom-24 left-32 h-3 w-16 rounded bg-green-300 opacity-40 blur-sm" />
      </div>

      <div className="relative flex min-h-svh items-center justify-center p-6">
        <SuspenseQueryBoundary fallback={<ProfileCardSkeleton />}>
          <ProfileCard />
        </SuspenseQueryBoundary>
      </div>
    </div>
  )
}

function ProfileCard() {
  const { data: allProfiles } = useSuspenseQuery(allProfilesQueryOptions)

  return (
    <Card className="flex w-full max-w-xl overflow-hidden">
      <CardHeader className="gap-3">
        <CardTitle className="text-lg">Select a Profile</CardTitle>
        <CardDescription className="text-balance text-base">
          Select a profile below to manage its lists and settings or{' '}
          <Link
            to="/onboarding"
            className="text-primary hover:underline hover:underline-offset-4"
          >
            create a new profile.
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full py-6">
        {allProfiles.length === 0 ? (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">No profiles found</p>
            <Button asChild>
              <Link to="/onboarding">Create your first profile</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {allProfiles.map((profile: Profile) => (
              <Link
                key={profile.slug}
                to="/dashboard/$profileSlug"
                params={{ profileSlug: profile.slug }}
              >
                <Card className="hover:border-primary/50 group h-full w-60 cursor-pointer overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="flex min-w-0 flex-col items-center justify-between space-y-2 pb-3">
                    <CardTitle className="group-hover:text-primary wrap-anywhere w-full truncate text-center text-xl transition-colors">
                      {profile.slug}
                    </CardTitle>
                    <Badge
                      variant={
                        profile.status === 'active' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {startCase(profile.status)}
                    </Badge>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
