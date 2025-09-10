import { Link } from '@tanstack/react-router'

import type { List } from '@shared/types'
import { startCase } from 'lodash'
import { LockIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface WithPublicListsProps {
  profileSlug: string
  lists: List[]
}

export function ProfileListsGrid({ profileSlug, lists }: WithPublicListsProps) {
  const placeholderImage =
    'https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg'

  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-20">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list, index) => (
          <Card key={index} className="w-full max-w-xs">
            <CardHeader>
              <div className="relative mb-4 block aspect-[3/2] w-full">
                <img
                  src={list.listType.imageUrl || placeholderImage}
                  alt={list.name}
                  className="absolute size-full rounded-xl object-cover"
                />
                {list.isPrivate && (
                  <Badge className="bg-background absolute right-4 top-4 px-2 py-1">
                    <LockIcon className="size-4 text-black" />
                  </Badge>
                )}
              </div>
              <CardTitle>{startCase(list.name)}</CardTitle>
              <CardDescription className="flex flex-col gap-1 text-gray-600">
                <p className="text-sm">{startCase(list.listType.name)}</p>
                <p className="text-xs">Created: {list.createdAt}</p>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link
                  to="/$profileSlug/$listSlug"
                  params={{ profileSlug, listSlug: list.slug }}
                >
                  View List
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
