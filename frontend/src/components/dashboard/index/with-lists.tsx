import { Link } from '@tanstack/react-router'

import type { List } from '@shared/types'

import { Button } from '@/components/ui/button'

interface WithListsProps {
  profileSlug: string
  lists: List[]
}

export function WithLists({ profileSlug, lists }: WithListsProps) {
  return (
    <div className="w-full px-8 py-4">
      <h4 className="mb-4 text-lg font-semibold">Your wish lists</h4>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-12">
        <div className="grid gap-2 md:col-span-2">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {lists.map((list) => (
              <div
                key={list.slug}
                className="grid grid-flow-col grid-rows-2 gap-4 rounded-lg border p-4"
              >
                <div className="grid">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{list.name}</h5>
                    <p className="text-sm">{list.status}</p>
                  </div>

                  {list.description && (
                    <p className="text-muted-foreground mt-1 text-pretty text-sm">
                      {list.description}
                    </p>
                  )}
                </div>
                <div className="grid">
                  <Button variant="outline" className="mt-2 w-full" asChild>
                    <Link
                      to="/dashboard/$profileSlug/$listSlug"
                      params={{ profileSlug, listSlug: list.slug }}
                    >
                      View List
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <h4 className="mb-4 text-lg font-semibold">Activity</h4>
          <p className="text-muted-foreground text-sm">No recent activity</p>
        </div>
      </div>
    </div>
  )
}
