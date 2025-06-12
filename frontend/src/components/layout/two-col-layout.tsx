import type { PropsWithChildren } from 'react'
import { Link } from '@tanstack/react-router'

import MobileLogo from '@/assets/logos/logo-mobile.svg'
import PrimaryLogo from '@/assets/logos/logo-primary.svg'

export const TwoColLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main className="grid min-h-svh grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col">
          <nav className="w-full items-center justify-center px-[10%] py-2">
            <Link to="/">
              <img
                src={MobileLogo}
                alt="My Happy Everything"
                className="lg:hidden"
                width="90"
                height="42"
              />
            </Link>
            <Link to="/">
              <img
                src={PrimaryLogo}
                alt="My Happy Everything"
                className="hidden lg:block"
                width="320"
                height="63"
              />
            </Link>
          </nav>
          <div className="flex w-full flex-1 items-center justify-center p-6 md:p-10">
            {children}
          </div>
        </div>
        <div className="relative p-6 md:p-0">
          <img
            src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
            alt="Product placeholder"
            className="inset-0 h-full w-auto rounded-2xl object-cover md:rounded-none dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </main>
    </>
  )
}
