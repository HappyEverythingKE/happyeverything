import { Link } from '@tanstack/react-router'

import FacebookIcon from '@/assets/icons/facebook-icon.svg'
import InstagramIcon from '@/assets/icons/instagram-icon.svg'
import FooterLogo from '@/assets/logos/logo-footer.svg'

import { Button } from '../ui/button'

const columnLinks = [
  {
    title: 'Get in touch',
    links: [
      { title: 'Contact Us', url: '#', external: false },
      { title: 'Instagram', url: '#', icon: InstagramIcon, external: true },
      { title: 'Facebook', url: '#', icon: FacebookIcon, external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { title: 'Privacy Policy', url: '#', external: false },
      { title: 'Terms of Service', url: '#', external: false },
      { title: 'Cookie Settings', url: '#', external: false },
    ],
  },
]

export function Footer() {
  return (
    <footer
      id="footer"
      className="bg-tertiary text-tertiary-foreground px-[5%] py-12"
    >
      <div className="container">
        <div className="border-border-primary border-b">
          <div className="mb-12 grid grid-cols-1 gap-x-[8vw] gap-y-12 md:mb-18 md:gap-y-16 lg:mb-20 lg:grid-cols-[1fr_0.5fr] lg:gap-y-20">
            <div className="max-w-md">
              <h1 className="mb-5 text-xl md:mb-6 md:text-3xl">
                Ready to get the gifts you&apos;ll love?
              </h1>
              <p>
                Start your first wish list in minutes and bring more joy to your
                next celebration.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
                <Button asChild variant="secondary">
                  <Link to="/">Create your free wish list</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 items-start gap-x-4 gap-y-5 sm:grid-cols-2 md:gap-x-8 md:gap-y-4">
              {columnLinks.map((column, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start justify-start"
                >
                  <h2 className="mb-3 font-sans font-semibold md:mb-4">
                    {column.title}
                  </h2>
                  <ul>
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex} className="py-2 text-sm font-medium">
                        <a
                          href={link.url}
                          target={link.external ? '_blank' : '_self'}
                          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                        >
                          {link.icon && (
                            <span>
                              <img src={link.icon} alt=""></img>
                            </span>
                          )}
                          <span>{link.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="flex pb-6 sm:flex-row sm:items-center md:pb-8 lg:justify-end">
            <Link to="/">
              <img
                src={FooterLogo}
                alt="My Happy Everything"
                width="300px"
                height="140px"
                className="mb-6 inline-block w-full sm:mb-0"
              />
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between pt-6 pb-4 text-center text-sm md:flex-row md:items-center md:pt-8 md:pb-0">
          <p className="mt-5 mb-2 font-medium md:mt-0">
            &copy; {new Date().getFullYear()} My Happy Everything. All rights
            reserved.
          </p>
          <a
            href="https://www.sonadostudio.com"
            target="_blank"
            className="font-medium hover:underline hover:underline-offset-4"
          >
            Site credit
          </a>
        </div>
      </div>
    </footer>
  )
}
