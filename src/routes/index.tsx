import { createFileRoute } from '@tanstack/react-router'

import { BenefitSection } from '@/components/marketing/benefit-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { SolutionSection } from '@/components/marketing/solution-section'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex flex-col">
      <SolutionSection />
      <BenefitSection />
      <FaqSection />
    </div>
  )
}
