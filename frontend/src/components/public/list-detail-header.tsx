import { Link } from '@tanstack/react-router'

import type { PublicListOwner } from '@shared/types'
import { DotIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ListDetailHeader({
  listOwner,
  listInfo,
}: {
  listOwner: PublicListOwner
  listInfo: {
    name: string
    description: string
    createdAt: string
  }
}) {
  const placeholderImage =
    'https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg'

  return (
    <header>
      <section className="relative mt-4 overflow-hidden px-4 py-20">
        <div className="absolute inset-0 opacity-30">
          <img
            src={placeholderImage}
            alt="placeholder"
            className="aspect-video h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl rounded-xl bg-white/40 p-8 text-center backdrop-blur-lg">
          <h1 className="mb-4 text-balance text-3xl md:text-4xl">
            {listInfo.name}
          </h1>
          <div className="mb-6 flex items-center justify-center">
            <Button
              variant="link"
              asChild
              className="gap-2 px-0 text-base font-medium text-gray-700"
            >
              <Link
                className="underline"
                to="/$profileSlug"
                params={{ profileSlug: listOwner.profileSlug }}
              >
                By {listOwner.name}
              </Link>
            </Button>

            <DotIcon className="size-6 text-gray-800" />

            <p className="text-base font-medium text-gray-700">
              {listInfo.createdAt}
            </p>
          </div>
          <p className="text-md mx-auto max-w-2xl leading-relaxed text-gray-700">
            {listInfo.description}
          </p>
        </div>
      </section>
    </header>
  )
}
