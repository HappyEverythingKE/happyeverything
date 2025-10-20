import { Link } from '@tanstack/react-router'

import { motion, useScroll, useTransform } from 'motion/react'
import { useMediaQuery } from 'usehooks-ts'

import { marketingImages } from '@/lib/marketing-images'
import { Button } from '@/components/ui/button'
import { ShimmerImage } from '@/components/ui/shimmer-image'

const images = [
  {
    src: marketingImages.coupleGifting,
    alt: 'Couple exchanging a gift',
    width: 1020,
    height: 1530,
  },
  {
    src: marketingImages.friendsWithGiftbox,
    alt: 'Friends with a large giftbox',
    width: 1020,
    height: 1530,
  },
  {
    src: marketingImages.boyWithPuppy,
    alt: 'Boy holding a puppy',
    width: 1020,
    height: 1530,
  },
  {
    src: marketingImages.boyWithToyCar,
    alt: 'Boy with a toy car gift',
    width: 1020,
    height: 1530,
  },
  {
    src: marketingImages.siblingsGift,
    alt: 'Siblings with a giftbox',
    width: 1020,
    height: 1530,
  },
  {
    src: marketingImages.grandmaGift,
    alt: 'Grandma with a gift',
    width: 1020,
    height: 1530,
  },
  {
    src: marketingImages.coupleGifting,
    alt: 'Couple exchanging a gift',
    width: 1020,
    height: 1530,
  },
]

export function HeroSection() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { scrollYProgress } = useScroll()

  const createTransform = (mobileValues: string[], desktopValues: string[]) =>
    useTransform(
      scrollYProgress,
      [0, 1],
      isMobile ? mobileValues : desktopValues,
    )

  const leftImageGroup = {
    x: createTransform(['0vw', '-25vw'], ['0vw', '-32vw']),
  }
  const centerImageContainer = {
    x: createTransform(['0vw', '-25vw'], ['0vw', '-32vw']),
    width: createTransform(['50vw', '100vw'], ['36vw', '100vw']),
    height: createTransform(['60vh', '100vh'], ['80vh', '100vh']),
  }
  const rightImageGroup = {
    x: createTransform(['0vw', '25vw'], ['0vw', '32vw']),
  }

  return (
    <section id="home-hero" className="relative">
      <div className="px-[5%] pt-16 md:pt-24 lg:pt-28">
        <div className="mx-auto w-full max-w-3xl text-center">
          <h1 className="mb-5 text-4xl md:mb-6 md:text-5xl">
            No more guesswork.
            <br />
            Just gifts you&apos;ll <span className="font-italic">love.</span>
          </h1>
          <p className="md:text-lg">
            Celebrate birthdays, weddings and everything in between. Whether
            you’re the one receiving or giving, experience gifting made joyful,
            simple, and stress-free.
          </p>
          <div className="mt-6 flex items-center justify-center md:mt-8">
            <Button asChild size="lg">
              <Link to="/signup">Create your wish list - it&apos;s free!</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div className="z-10 grid h-[60vh] w-full grid-flow-col grid-cols-[25%_50%_25%] content-center items-center justify-center md:h-[70vh] md:grid-cols-[32%_36%_32%] lg:h-[80vh]">
          <motion.div
            className="grid grid-flow-col grid-cols-1 items-center justify-items-end gap-4 justify-self-end px-4"
            style={leftImageGroup}
          >
            <div className="relative hidden md:block md:w-[25vw] lg:w-[20vw]">
              <ShimmerImage
                className="aspect-[2/3] w-full"
                src={images[0].src}
                alt={images[0].alt}
                width={images[0].width}
                height={images[0].height}
              />
            </div>

            <div className="relative grid w-[40vw] grid-cols-1 grid-rows-[auto_auto] gap-4 self-center md:w-[18vw]">
              <ShimmerImage
                className="aspect-square w-full"
                src={images[1].src}
                alt={images[1].alt}
                width={images[1].width}
                height={images[1].height}
              />
              <ShimmerImage
                className="aspect-[3/4] w-full"
                src={images[2].src}
                alt={images[2].alt}
                width={images[2].width}
                height={images[2].height}
              />
            </div>
          </motion.div>

          <motion.div className="relative" style={centerImageContainer}>
            <ShimmerImage
              className="size-full"
              src={images[3].src}
              alt={images[3].alt}
              width={images[3].width}
              height={images[3].height}
            />
          </motion.div>

          <motion.div
            className="grid grid-flow-col items-center justify-items-start gap-4 justify-self-start px-4"
            style={rightImageGroup}
          >
            <div className="relative grid w-[40vw] grid-cols-1 grid-rows-[auto_auto] gap-4 self-center md:w-[18vw]">
              <ShimmerImage
                className="aspect-[3/4] w-full"
                src={images[4].src}
                alt={images[4].alt}
                width={images[4].width}
                height={images[4].height}
              />
              <ShimmerImage
                className="aspect-square w-full"
                src={images[5].src}
                alt={images[5].alt}
                width={images[5].width}
                height={images[5].height}
              />
            </div>

            <div className="relative hidden md:block md:w-[25vw] lg:w-[20vw]">
              <ShimmerImage
                className="aspect-[2/3] w-full"
                src={images[6].src}
                alt={images[6].alt}
                width={images[6].width}
                height={images[6].height}
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 mt-[100vh]" />
    </section>
  )
}
