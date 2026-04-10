import { useState } from 'react'
import { Link } from '@tanstack/react-router'

import MobileLogo from '@/assets/logos/logo-mobile.svg'
import PrimaryLogo from '@/assets/logos/logo-primary.svg'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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

export function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    // FIX: Removed `overflow-hidden` from <header> — on Android browsers it creates a
    // stacking/clipping context that swallows touch events for elements below it.
    // `overflow-hidden` is kept on the inner motion.div where it's actually needed
    // for the animated height transition.
    <header>
      <div className="z-[999] mt-1 flex w-full items-center py-2 lg:min-h-20 lg:px-[5%] lg:pb-4">
        <nav className="size-full lg:flex lg:items-end lg:justify-between">
          <div className="md:min-h-18 flex min-h-16 items-center justify-between px-[5%] lg:min-h-full lg:px-0">
            <Link to="/">
              <img
                src={MobileLogo}
                alt="Happy Everything"
                className="lg:hidden"
                width="90"
                height="42"
              />
            </Link>
            <Link to="/">
              <img
                src={PrimaryLogo}
                alt="Happy Everything"
                className="hidden lg:block"
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
            <div className="mt-6 flex flex-col items-center gap-4 lg:ml-4 lg:mt-0 lg:flex-row">
             <Button asChild variant="link">
  <a
    href="https://blog.myhappyeverything.com/"
    target="_blank"
    className={cn(
      isMobileMenuOpen && '-mb-4',
      'py-3 text-center lg:px-1 lg:py-2',
    )}
  >
    May Picks
  </a>
</Button>
              <Button asChild variant="link">
                <a
                  href="mailto:hello@happyeverything.com"
                  target="_blank"
                  className={cn(
                    isMobileMenuOpen && '-mb-1',
                    'py-3 text-center lg:px-4 lg:py-2',
                  )}
                >
                  Contact us
                </a>
              </Button>
              {isAuthenticated ? (
                <Button
                  asChild
                  variant="outline"
                  className={cn(isMobileMenuOpen && 'w-full')}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className={cn(isMobileMenuOpen && 'w-full')}
                  >
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                  </Button>
                  <Button asChild className={cn(isMobileMenuOpen && 'w-full')}>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign up free
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </nav>
      </div>
    </header>
  )
}
