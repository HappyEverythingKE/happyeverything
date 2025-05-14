import { createFileRoute } from '@tanstack/react-router'

import { BenefitSection } from '@/components/marketing/benefit-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { HeroSection } from '@/components/marketing/hero-section'
import { SolutionSection } from '@/components/marketing/solution-section'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
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
