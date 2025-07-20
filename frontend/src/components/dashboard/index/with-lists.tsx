import type { List } from '@shared/types'

interface WithListsProps {
  lists: List[]
}

export function WithLists({ lists }: WithListsProps) {
  return (
    <>
      <div className="col-span-2">
        <h4 className="mb-4 text-lg font-semibold">
          Your Lists ({lists.length})
        </h4>
        <div className="grid gap-4">
          {lists.map((list) => (
            <div key={list.id} className="rounded-lg border p-4">
              <h5 className="font-medium">
                {list.name} | {list.slug}
              </h5>
              {list.description && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {list.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-4 text-lg font-semibold">Activity</h4>
        <p className="text-muted-foreground text-sm">No recent activity</p>
      </div>
    </>
  )
}
