import { Link } from '@tanstack/react-router'

import HeroImage from '@/assets/images/woman-with-giftbox.png'

import { Button } from '@/components/ui/button'

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
      src: 'https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg',
      alt: 'Customizable wish lists',
    },
    heading: 'Customizable wish lists',
    description:
      'Add photos, links, colours and sizes to make sure every gift is exactly what you’re hoping for.',
  },
  {
    image: {
      src: 'https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg',
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
      src: 'https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg',
      alt: 'Real-time gift tracking',
    },
    heading: 'Real-time gift tracking',
    description:
      'Get notified when someone crosses-off an item from your list and avoid duplicate gifts.',
  },
  {
    image: {
      src: 'https://d22po4pjz3o32e.cloudfront.net/relume-icon.svg',
      alt: 'Free to use',
    },
    heading: '100% Free to use',
    description:
      'No fees, no subscriptions. Just an easy, hassle-free way to create and share your wish lists.',
  },
]

const FeatureSection = ({ sections }: { sections: SectionProps[] }) => (
  <div className="grid w-full grid-cols-1 gap-x-20 gap-y-12 md:gap-y-16">
    {sections.map((section, index) => (
      <div key={index} className="flex flex-col items-center text-center">
        <div className="mb-5 md:mb-6">
          <img
            src={section.image.src}
            className="size-12"
            alt={section.image.alt}
          />
        </div>
        <h3 className="md:text-md mb-3 text-sm md:mb-4">{section.heading}</h3>
        <p>{section.description}</p>
      </div>
    ))}
  </div>
)

export function BenefitSection() {
  return (
    <section id="benefits" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="mb-12 md:mb-18 lg:mb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-5 text-xl md:mb-6 md:text-2xl">
            Why settle for guesswork? <br />
            Get the gifts you <span className="font-italic">actually</span> want
          </h2>
          <p className="md:text-md text-balance">
            My Happy Everything makes it simple for your loved ones to know
            exactly what you want, so every gift feels personal and appreciated.
            <br />
            No confusion. No duplicates. Just joyful, thoughtful giving.
          </p>
        </div>
      </div>
      <div className="grid place-items-center gap-x-8 gap-y-12 sm:grid-cols-2 md:gap-y-16 lg:grid-cols-[1fr_1.5fr_1fr] lg:gap-x-12">
        <FeatureSection sections={leftSections} />
        <div className="relative order-last w-full sm:col-span-2 lg:order-none lg:col-span-1">
          <img
            src={HeroImage}
            alt="Woman with gift box"
            className="h-auto w-full rounded-2xl object-cover"
            width="1024"
            height="1024"
          />
        </div>
        <FeatureSection sections={rightSections} />
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-4 md:mt-18 lg:mt-20">
        <Button asChild>
          <Link to="/">Create your first wish list</Link>
        </Button>
      </div>
    </section>
  )
}
