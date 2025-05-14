import { createFileRoute } from '@tanstack/react-router'

import { SolutionSection } from '@/components/marketing/solution-section'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex flex-col">
      <SolutionSection />
    </div>
  )
}
