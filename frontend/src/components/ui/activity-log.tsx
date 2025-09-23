import { useSuspenseQuery } from '@tanstack/react-query'

import { profileGiftActivityQueryOptions } from '@/services/list.api'
import type { ProfileGiftActivity } from '@shared/types'
import { Gift } from 'lucide-react'

export function ActivityLog({ profileSlug }: { profileSlug: string }) {
  const { data: activity } = useSuspenseQuery(
    profileGiftActivityQueryOptions(profileSlug),
  )

  if ('error' in activity) {
    return (
      <div className="bg-card border-border max-h-[45vh] overflow-y-auto rounded-lg border p-4">
        <p className="text-sm text-gray-500">
          Oops! Failed to fetch profile activity.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card border-border max-h-[45vh] overflow-y-auto rounded-lg border p-4">
        {activity.length > 0 ? (
          <div className="space-y-4">
            {activity.map((log: ProfileGiftActivity, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  <Gift className="text-muted-foreground h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-relaxed">
                    {log.gifterName || 'Someone'} got you a gift from{' '}
                    {log.listName} list!
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{log.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No recent activity</p>
        )}
      </div>
    </>
  )
}
