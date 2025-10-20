import { Link } from '@tanstack/react-router'

import { marketingImages } from '@/lib/marketing-images'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShimmerImage } from '@/components/ui/shimmer-image'

type ImageProps = {
  src: string
  alt: string
}

type SectionProps = {
  image: ImageProps
  heading: string
  description: string
}

const images = {
  prevOne: marketingImages.listTypePreview,
  prevTwo: marketingImages.sharePreview,
  prevThree: marketingImages.activityPreview,
  prevFour: marketingImages.itemCardPreview,
}

const topSections = [
  {
    image: {
      src: images.prevOne,
      alt: 'Customizable wish lists',
    },
    heading: 'Customizable wish lists',
    description:
      'Add photos, links, colours and sizes to make sure every gift is exactly what you’re hoping for.',
  },
  {
    image: {
      src: images.prevTwo,
      alt: 'Share on your terms',
    },
    heading: 'Share on your terms',
    description:
      'Keep your list private with a password or share it publicly—it’s up to you!',
  },
]

const bottomSections = [
  {
    image: {
      src: images.prevThree,
      alt: 'Real-time gift tracking',
    },
    heading: 'Real-time gift tracking',
    description:
      'Get notified when someone crosses-off an item from your list and avoid duplicate gifts.',
  },
  {
    image: {
      src: images.prevFour,
      alt: 'Free to use',
    },
    heading: '100% Free to use',
    description:
      'No fees, no subscriptions. Just an easy, hassle-free way to create and share your wish lists.',
  },
]

const FeatureSection = ({ sections }: { sections: SectionProps[] }) => (
  <div className="grid w-full grid-flow-col grid-cols-1 grid-rows-2 gap-x-12 gap-y-12">
    {sections.map((section, index) => (
      <Card
        key={index}
        className="to-blush/20 h-full bg-gradient-to-b from-transparent p-6 text-center lg:gap-10 lg:p-10"
      >
        <CardHeader className="gap-2">
          <CardTitle className="text-xl">
            <h3>{section.heading}</h3>
          </CardTitle>
          <CardDescription className="text-md mx-auto text-balance text-center lg:max-w-lg">
            {section.description}
          </CardDescription>
        </CardHeader>
        <div className="relative mx-auto mb-2 w-[90%]">
          <ShimmerImage
            src={section.image.src}
            alt={section.image.alt}
            width={800}
            height={500}
            className="absolute inset-0 aspect-video"
            imgClassName="object-contain"
            lazy={true}
          />
        </div>
      </Card>
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
        <div className="mt-8 flex items-center justify-center">
          <Button asChild size="lg">
            <Link to="/signup">Create your first wish list</Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 place-items-center gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:gap-x-12">
        <FeatureSection sections={topSections} />
        <FeatureSection sections={bottomSections} />
      </div>
    </section>
  )
}
