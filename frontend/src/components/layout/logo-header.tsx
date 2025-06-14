import { Link } from '@tanstack/react-router'

import MobileLogo from '@/assets/logos/logo-mobile.svg'
import PrimaryLogo from '@/assets/logos/logo-primary.svg'

export const LogoHeader = () => {
  return (
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
    </div>
  )
}
