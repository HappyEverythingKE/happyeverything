import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import { motion } from 'motion/react'

import { cn } from '@/lib/utils'
import MobileLogo from '@/components/assets/logos/logo-mobile.svg'
import PrimaryLogo from '@/components/assets/logos/logo-primary.svg'

import { Button } from '../ui/button'

const topLineVariants = {
  open: {
    translateY: 8,
    transition: { delay: 0.1 },
  },
  rotatePhase: {
    rotate: -45,
    transition: { delay: 0.2 },
  },
  closed: {
    translateY: 0,
    rotate: 0,
    transition: { duration: 0.2 },
  },
}

const middleLineVariants = {
  open: {
    width: 0,
    transition: { duration: 0.1 },
  },
  closed: {
    width: '1.5rem',
    transition: { delay: 0.3, duration: 0.2 },
  },
}

const bottomLineVariants = {
  open: {
    translateY: -8,
    transition: { delay: 0.1 },
  },
  rotatePhase: {
    rotate: 45,
    transition: { delay: 0.2 },
  },
  closed: {
    translateY: 0,
    rotate: 0,
    transition: { duration: 0.2 },
  },
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-background-primary z-[999] flex w-full items-center py-2 lg:min-h-20 lg:px-[5%] lg:pb-4">
      <nav className="size-full lg:flex lg:items-end lg:justify-between">
        <div className="flex min-h-16 items-center justify-between px-[5%] md:min-h-18 lg:min-h-full lg:px-0">
          <Link to="/">
            <img
              src={MobileLogo}
              alt="My Happy Everything"
              className="md:hidden"
              width="90"
              height="42"
            />
          </Link>
          <Link to="/">
            <img
              src={PrimaryLogo}
              alt="My Happy Everything"
              className="hidden md:block"
              width="320"
              height="63"
            />
          </Link>
          <button
            className="-mr-2 flex size-12 flex-col items-center justify-center lg:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <motion.span
              className="my-[3px] h-0.5 w-6 bg-black"
              animate={isMobileMenuOpen ? ['open', 'rotatePhase'] : 'closed'}
              variants={topLineVariants}
            />
            <motion.span
              className="my-[3px] h-0.5 w-6 bg-black"
              animate={isMobileMenuOpen ? 'open' : 'closed'}
              variants={middleLineVariants}
            />
            <motion.span
              className="my-[3px] h-0.5 w-6 bg-black"
              animate={isMobileMenuOpen ? ['open', 'rotatePhase'] : 'closed'}
              variants={bottomLineVariants}
            />
          </button>
        </div>
        <motion.div
          variants={{
            open: {
              height: 'var(--height-open, 100dvh)',
            },
            close: {
              height: 'var(--height-closed, 0)',
            },
          }}
          initial="close"
          exit="close"
          animate={isMobileMenuOpen ? 'open' : 'close'}
          transition={{ duration: 0.4 }}
          className="overflow-hidden px-[5%] lg:flex lg:items-center lg:px-0 lg:[--height-closed:auto] lg:[--height-open:auto]"
        >
          <Link
            to="/"
            className="text-md block py-3 text-center first:pt-7 hover:underline hover:underline-offset-4 lg:px-4 lg:py-2 lg:text-base first:lg:pt-2"
          >
            Contact
          </Link>

          <div className="mt-6 flex flex-col items-center gap-4 lg:mt-0 lg:ml-4 lg:flex-row">
            <Button
              asChild
              variant="secondary"
              className={cn(isMobileMenuOpen && 'w-full')}
            >
              <Link to="/">Log in</Link>
            </Button>
            <Button
              asChild
              className={cn(
                'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
                isMobileMenuOpen && 'h-9 w-full px-4 py-2 has-[>svg]:px-3',
              )}
            >
              <Link to="/">Sign up free</Link>
            </Button>
          </div>
        </motion.div>
      </nav>
    </header>
  )
}
