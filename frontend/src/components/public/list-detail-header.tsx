import { Link } from '@tanstack/react-router'

import type { PublicListOwner } from '@shared/types'

import { Button } from '@/components/ui/button'

export function ListDetailHeader({
  listOwner,
  listInfo,
}: {
  listOwner: PublicListOwner
  listInfo: {
    name: string
    description: string
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
          <h1 className="mb-4 text-balance text-3xl text-gray-900 md:text-4xl">
            {listInfo.name}
          </h1>
          <Button variant="link" asChild className="mb-6 text-lg text-gray-700">
            <Link
              to="/$profileSlug"
              params={{ profileSlug: listOwner.profileSlug }}
            >
              {listOwner.name}
            </Link>
          </Button>
          <p className="mx-auto max-w-2xl leading-relaxed text-gray-600">
            {listInfo.description}
          </p>
        </div>
      </section>
    </header>
  )
}
