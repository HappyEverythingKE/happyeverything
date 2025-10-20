import { Link } from '@tanstack/react-router'

import listTypePlaceholder from '@/assets/list-type-banner-placeholder.jpg'
import type { PublicListOwner } from '@shared/types'
import { DotIcon } from 'lucide-react'

import { getImageVariantUrl } from '@/lib/get-image-variant-url'
import { Button } from '@/components/ui/button'
import { ShimmerImage } from '@/components/ui/shimmer-image'

export function ListDetailHeader({
  listOwner,
  listInfo,
}: {
  listOwner: PublicListOwner
  listInfo: {
    name: string
    description: string
    createdAt: string
    bannerImageId?: string
  }
}) {
  return (
    <header className="w-full">
      <section className="relative mt-6 overflow-hidden py-8">
        <div className="absolute inset-0 opacity-90">
          <ShimmerImage
            src={
              getImageVariantUrl({
                imageId: listInfo.bannerImageId,
                context: 'marketing-large',
              }) || listTypePlaceholder
            }
            className="aspect-video h-full w-full rounded-none"
            imgClassName="object-cover"
            alt="List banner"
          />
        </div>

        <div className="relative z-10 mx-auto w-full bg-white/70 p-8 text-center backdrop-blur-lg">
          <h1 className="mb-3 text-balance text-3xl md:text-4xl">
            {listInfo.name}
          </h1>
          <div className="mb-3 flex flex-col items-center justify-center md:flex-row">
            <Button
              variant="link"
              asChild
              className="gap-2 px-0 text-base font-medium text-gray-700"
            >
              <Link
                className="underline underline-offset-2"
                to="/$profileSlug"
                params={{ profileSlug: listOwner.profileSlug }}
              >
                By {listOwner.name}
              </Link>
            </Button>

            <DotIcon className="hidden size-6 md:block" />

            <p className="text-base font-medium text-gray-700">
              {listInfo.createdAt}
            </p>
          </div>
          <p className="mx-auto max-w-xl text-balance text-lg leading-relaxed">
            {listInfo.description}
          </p>
        </div>
      </section>
    </header>
  )
}
