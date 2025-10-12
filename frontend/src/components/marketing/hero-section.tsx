import { Link } from '@tanstack/react-router'

import imageEdges from '@/assets/images/couple-with-flowers.png'
import imageLeftTwo from '@/assets/images/couple-with-giftbox.png'
import imageLeftThree from '@/assets/images/father-and-daughter.png'
import imageRightOne from '@/assets/images/mother-and-son.png'
import imageRightTwo from '@/assets/images/pregnant-woman-flowers.png'
import imageCenter from '@/assets/images/women-holding-flowers.png'
import { motion, useScroll, useTransform } from 'motion/react'
import { useMediaQuery } from 'usehooks-ts'

import { Button } from '@/components/ui/button'

const images = [
  {
    src: imageEdges,
  },
  {
    src: imageLeftTwo,
  },
  {
    src: imageLeftThree,
  },
  {
    src: imageCenter,
  },
  {
    src: imageRightOne,
  },
  {
    src: imageRightTwo,
  },
  {
    src: imageEdges,
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
            <span className="font-italic">Just gifts you&apos;ll love.</span>
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
              <img
                className="aspect-[2/3] w-full rounded-2xl object-cover"
                {...images[0]}
                alt="Couple exchanges flowers"
                width="1020"
                height="1020"
              />
            </div>

            <div className="relative grid w-[40vw] grid-cols-1 grid-rows-[auto_auto] gap-4 self-center md:w-[18vw]">
              <div className="relative">
                <img
                  className="aspect-square w-full rounded-2xl object-cover"
                  {...images[1]}
                  alt="Couple exchanges giftbox"
                  width="1020"
                  height="1020"
                />
              </div>
              <div className="relative">
                <img
                  className="aspect-[3/4] w-full rounded-2xl object-cover"
                  {...images[2]}
                  alt="Father and daughter celebrate"
                  width="1020"
                  height="1020"
                />
              </div>
            </div>
          </motion.div>

          <motion.div className="relative" style={centerImageContainer}>
            <img
              className="size-full rounded-2xl object-cover"
              {...images[3]}
              alt="Friends exchange flowers"
              width="1020"
              height="1020"
            />
          </motion.div>

          <motion.div
            className="grid grid-flow-col items-center justify-items-start gap-4 justify-self-start px-4"
            style={rightImageGroup}
          >
            <div className="relative grid w-[40vw] grid-cols-1 grid-rows-[auto_auto] gap-4 self-center md:w-[18vw]">
              <div className="relative w-[40vw] sm:w-auto">
                <img
                  className="aspect-[3/4] w-full rounded-2xl object-cover"
                  {...images[4]}
                  alt="Mother and son celebrate"
                  width="1020"
                  height="1020"
                />
              </div>
              <div className="relative w-[40vw] sm:w-auto">
                <img
                  className="aspect-square w-full rounded-2xl object-cover"
                  {...images[5]}
                  alt="Pregnant woman receives flowers"
                  width="1020"
                  height="1020"
                />
              </div>
            </div>

            <div className="relative hidden md:block md:w-[25vw] lg:w-[20vw]">
              <img
                className="aspect-[2/3] w-full rounded-2xl object-cover"
                {...images[6]}
                alt="Couple exchanges flowers"
                width="1020"
                height="1020"
              />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 mt-[100vh]" />
    </section>
  )
}
