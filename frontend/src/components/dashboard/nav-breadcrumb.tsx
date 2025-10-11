import * as React from 'react'
import { isMatch, Link, useMatches } from '@tanstack/react-router'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function NavBreadcrumb({ userName }: { userName: string }) {
  const matches = useMatches()
  const matchesWithCrumbs = matches.filter((match) =>
    isMatch(match, 'loaderData.crumb'),
  )

  const breadcrumbs = matchesWithCrumbs.map(({ pathname, loaderData }) => {
    return {
      href: pathname,
      label: loaderData?.crumb,
    }
  })

  const isHome = breadcrumbs.length === 1 && breadcrumbs[0].label === 'Home'
  const isAccount =
    breadcrumbs.length === 1 && breadcrumbs[0].label === 'Account'

  return (
    <>
      {isHome ? (
        <h1 className="md:text-md">Welcome @{userName}</h1>
      ) : isAccount ? (
        <h1 className="md:text-md">
          <Link to="/dashboard">Back to Home</Link>
        </h1>
      ) : (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb) => {
              if (breadcrumbs.length - 1 === breadcrumbs?.indexOf(crumb)) {
                return (
                  <BreadcrumbItem key={crumb.href}>
                    <BreadcrumbPage className="font-semibold">
                      {crumb.label}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )
              }
              return (
                <React.Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
    </>
  )
}
