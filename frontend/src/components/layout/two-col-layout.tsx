import type { PropsWithChildren } from 'react'

import { LogoHeader } from '@/components/layout/logo-header'

export const TwoColLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main className="grid min-h-svh grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col">
          <LogoHeader />
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
