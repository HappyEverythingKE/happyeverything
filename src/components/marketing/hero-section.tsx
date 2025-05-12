import { Link } from '@tanstack/react-router'

import { motion, useScroll, useTransform } from 'motion/react'
import { useMediaQuery } from 'usehooks-ts'

import { Button } from '@/components/ui/button'

const images = [
  {
    src: 'https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg',
  },
  {
    src: 'https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg',
  },
  {
    src: 'https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg',
  },
  {
    src: 'https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg',
  },
  {
    src: 'https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg',
  },
  {
    src: 'https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg',
  },
  {
    src: 'https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg',
  },
  {
    src: 'https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg',
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
    <section id="home-hero" className="relative h-[250vh]">
      <div className="px-[5%] pt-16 md:pt-24 lg:pt-28">
        <div className="mx-auto w-full max-w-lg text-center">
          <h1 className="lg:text-10xl mb-5 text-6xl font-bold md:mb-6 md:text-9xl">
            No more guesswork.
            <br />
            <span className="italic">Just gifts you&apos;ll love.</span>
          </h1>
          <p className="md:text-md">
            Celebrate birthdays, weddings and everything in between. Whether
            you’re the one receiving or giving, experience gifting made joyful,
            simple, and stress-free.
          </p>
          <div className="mt-6 flex items-center justify-center gap-x-4 md:mt-8">
            <Button asChild>
              <Link to="/">Create your wish list - it&apos;s free!</Link>
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
              <img
                className="aspect-[2/3] w-full object-cover"
                {...images[0]}
                alt=""
              />
            </div>

            <div className="relative grid w-[40vw] grid-cols-1 grid-rows-[auto_auto] gap-4 self-center md:w-[18vw]">
              <div className="relative">
                <img
                  className="aspect-square w-full object-cover"
                  {...images[1]}
                  alt=""
                />
              </div>
              <div className="relative">
                <img
                  className="aspect-[3/4] w-full object-cover"
                  {...images[2]}
                  alt=""
                />
              </div>
            </div>
          </motion.div>

          <motion.div className="relative" style={centerImageContainer}>
            <img className="size-full object-cover" {...images[3]} alt="" />
          </motion.div>

          <motion.div
            className="grid grid-flow-col items-center justify-items-start gap-4 justify-self-start px-4"
            style={rightImageGroup}
          >
            <div className="relative grid w-[40vw] grid-cols-1 grid-rows-[auto_auto] gap-4 self-center md:w-[18vw]">
              <div className="relative w-[40vw] sm:w-auto">
                <img
                  className="aspect-[3/4] w-full object-cover"
                  {...images[4]}
                  alt=""
                />
              </div>
              <div className="relative w-[40vw] sm:w-auto">
                <img
                  className="aspect-square w-full object-cover"
                  {...images[5]}
                  alt=""
                />
              </div>
            </div>

            <div className="relative hidden md:block md:w-[25vw] lg:w-[20vw]">
              <img
                className="aspect-[2/3] w-full object-cover"
                {...images[6]}
                alt=""
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 mt-[100vh]" />
    </section>
  )
}
