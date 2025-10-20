import { Link } from '@tanstack/react-router'

import listTypePlaceholder from '@/assets/list-type-banner-placeholder.jpg'
import type { List } from '@shared/types'
import { startCase } from 'lodash'
import { LockIcon } from 'lucide-react'

import { getImageVariantUrl } from '@/lib/get-image-variant-url'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShimmerImage } from '@/components/ui/shimmer-image'

interface WithPublicListsProps {
  profileSlug: string
  lists: List[]
}

export function ProfileListsGrid({ profileSlug, lists }: WithPublicListsProps) {
  return (
    <section className="px-[15%] py-16">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list, index) => (
          <Card key={index} className="relative w-full md:max-w-xs">
            {list.isPrivate && (
              <Badge
                variant="blush"
                className="absolute right-0 top-0 z-10 rounded-none rounded-bl-lg rounded-tr-lg border-none px-4 py-3 [&>svg]:size-4"
              >
                <LockIcon className="text-destructive" />
              </Badge>
            )}
            <CardHeader>
              <div className="relative mb-6 block aspect-[3/2] w-full">
                <ShimmerImage
                  src={
                    getImageVariantUrl({
                      imageId: list.listType.imageId,
                      context: 'marketing-thumb',
                    }) || listTypePlaceholder
                  }
                  alt={list.name}
                  className="absolute size-full"
                  imgClassName="object-cover rounded-xl"
                />
              </div>
              <CardTitle>{list.name}</CardTitle>
              <CardDescription className="mt-2 flex flex-col text-sm">
                <p>{startCase(list.listType.name)}</p>
                <p>Created: {list.createdAt}</p>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link
                  to="/$profileSlug/$listSlug"
                  params={{ profileSlug, listSlug: list.slug }}
                >
                  View list
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
