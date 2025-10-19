import { Link } from '@tanstack/react-router'

import Image4 from '@/assets/app-previews/activity-preview.png'
import Image3 from '@/assets/app-previews/item-card-preview.png'
import Image1 from '@/assets/app-previews/list-type-preview.png'
import Image2 from '@/assets/app-previews/share-preview.png'

import { marketingImages } from '@/lib/marketing-images'
import { Button } from '@/components/ui/button'
import { ShimmerImage } from '@/components/ui/shimmer-image'

type ImageProps = {
  src: string
  alt?: string
}

type SectionProps = {
  image: ImageProps
  heading: string
  description: string
}

const leftSections = [
  {
    image: {
      src: Image1,
      alt: 'Customizable wish lists',
    },
    heading: 'Customizable wish lists',
    description:
      'Add photos, links, colours and sizes to make sure every gift is exactly what you’re hoping for.',
  },
  {
    image: {
      src: Image2,
      alt: 'Share on your terms',
    },
    heading: 'Share on your terms',
    description:
      'Keep your list private with a password or share it publicly—it’s up to you!',
  },
]

const rightSections = [
  {
    image: {
      src: Image3,
      alt: 'Free to use',
    },
    heading: '100% Free to use',
    description:
      'No fees, no subscriptions. Just an easy, hassle-free way to create and share your wish lists.',
  },
  {
    image: {
      src: Image4,
      alt: 'Real-time gift tracking',
    },
    heading: 'Real-time gift tracking',
    description:
      'Get notified when someone crosses-off an item from your list and avoid duplicate gifts.',
  },
]

const FeatureSection = ({ sections }: { sections: SectionProps[] }) => (
  <div className="grid w-full grid-cols-1 gap-x-20 gap-y-12 md:gap-y-16">
    {sections.map((section, index) => (
      <div key={index} className="flex flex-col items-center text-center">
        <div className="relative mb-5 aspect-video w-full md:mb-6">
          <img
            src={section.image.src}
            className="absolute inset-0 h-full w-full object-contain"
            width={200}
            height={200}
            loading="lazy"
            alt={section.image.alt}
          />
        </div>
        <h3 className="mb-1 text-lg">{section.heading}</h3>
        <p>{section.description}</p>
      </div>
    ))}
  </div>
)

export function BenefitSection() {
  return (
    <section id="benefits" className="px-[5%] pb-16 md:py-16">
      <div className="md:mb-18 mb-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-pretty text-2xl md:text-3xl">
            Why settle for guesswork? <br />
            Get the gifts you <span className="font-italic">actually</span> want
          </h2>
          <p className="text-pretty">
            Happy Everything makes it simple for your loved ones to know exactly
            what you want, so every gift feels personal and appreciated. No
            confusion. No duplicates. Just joyful, thoughtful giving.
          </p>
        </div>
      </div>
      <div className="grid place-items-center gap-x-8 gap-y-12 sm:grid-cols-2 md:gap-y-16 lg:grid-cols-[1fr_1.5fr_1fr] lg:gap-x-12">
        <FeatureSection sections={leftSections} />
        <div className="relative order-last w-full sm:col-span-2 lg:order-none lg:col-span-1">
          <ShimmerImage
            className="h-auto w-full rounded-2xl object-cover"
            src={marketingImages.girlWithDoll}
            alt="Girl with doll"
            width={768}
            height={768}
          />
        </div>
        <FeatureSection sections={rightSections} />
      </div>
      <div className="md:mt-18 mt-12 flex flex-wrap items-center justify-center gap-4 lg:mt-20">
        <Button asChild size="lg">
          <Link to="/signup">Create your first wish list</Link>
        </Button>
      </div>
    </section>
  )
}
