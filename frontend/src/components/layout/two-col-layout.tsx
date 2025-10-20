import type { PropsWithChildren } from 'react'

import { marketingImages } from '@/lib/marketing-images'
import { ShimmerImage } from '@/components/ui/shimmer-image'
import { LogoHeader } from '@/components/layout/logo-header'

export const TwoColLayout = ({ children }: PropsWithChildren) => {
  const heroImage = marketingImages.girlWithDoll

  return (
    <>
      <main className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
        <div className="mt-4 flex flex-col">
          <LogoHeader />
          <div className="flex w-full flex-1 items-center justify-center p-6 lg:p-10">
            {children}
          </div>
        </div>
        <div className="relative p-6 lg:p-0">
          <ShimmerImage
            src={heroImage}
            alt="Girl with a doll"
            width={768}
            height={768}
            className="inset-0 mx-auto h-auto rounded-2xl object-cover sm:w-full md:w-[60%] lg:h-full lg:w-full lg:rounded-none"
            imgClassName="object-cover"
          />
        </div>
      </main>
    </>
  )
}
