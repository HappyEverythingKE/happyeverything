import { Link } from '@tanstack/react-router'

import type { List } from '@shared/types'
import { Calendar } from 'lucide-react'

import { ActivityLog } from '@/components/ui/activity-log'
import { ActivityLogSkeleton } from '@/components/ui/activity-log-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SuspenseQueryBoundary } from '@/components/suspense-query-boundary'

interface WithListsProps {
  profileSlug: string
  lists: List[]
}

export function WithLists({ profileSlug, lists }: WithListsProps) {
  return (
    <div className="w-full px-8 py-4">
      <div className="grid grid-cols-1 gap-10 pt-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h4 className="mb-4 text-lg font-semibold">Your wish lists</h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {lists.map((list) => (
              <Card
                key={list.slug}
                className="relative grid grid-flow-col grid-rows-2 gap-6 overflow-hidden"
              >
                <div className="absolute right-0 top-0">
                  <Badge
                    variant={
                      list.status === 'published'
                        ? 'tangerine'
                        : list.status === 'draft'
                          ? 'coral'
                          : 'harbor'
                    }
                    className="rounded-none rounded-bl-lg border-none px-3 py-2 text-[10.5px]"
                  >
                    {list.status.toUpperCase()}
                  </Badge>
                </div>

                <CardHeader className="grid pt-6">
                  <CardTitle className="text-lg font-semibold">
                    {list.name}
                  </CardTitle>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    <span>Created {list.createdAt}</span>
                  </div>
                </CardHeader>
                <CardContent className="grid">
                  <p className="line-clamp-2 text-sm leading-relaxed">
                    {list.description}
                  </p>
                  <Button variant="outline" className="mt-3 w-full" asChild>
                    <Link
                      to="/dashboard/$profileSlug/$listSlug"
                      params={{ profileSlug, listSlug: list.slug }}
                    >
                      View list
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">Activity</h2>

          <SuspenseQueryBoundary fallback={<ActivityLogSkeleton />}>
            <ActivityLog profileSlug={profileSlug} />
          </SuspenseQueryBoundary>
        </div>
      </div>
    </div>
  )
}
