import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { toast } from 'sonner'
import { z } from 'zod'

import { BenefitSection } from '@/components/marketing/benefit-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { HeroSection } from '@/components/marketing/hero-section'
import { SolutionSection } from '@/components/marketing/solution-section'

const searchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/_marketing/')({
  validateSearch: searchSchema,
  component: App,
})

function App() {
  const { error } = Route.useSearch()

  // show error toast if redirected from failed profile load
  useEffect(() => {
    if (error === 'profile-not-found') {
      toast.error('Profile Not Found', {
        description: 'This profile could not be found',
      })
    }
  }, [error])

  return (
    <>
      <HeroSection />
      <div className="container mx-auto grow">
        <SolutionSection />
        <BenefitSection />
        <FaqSection />
      </div>
    </>
  )
}
