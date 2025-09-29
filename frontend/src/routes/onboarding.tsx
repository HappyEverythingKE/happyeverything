import { createFileRoute, redirect } from '@tanstack/react-router'

import { OnboardingForm } from '@/components/dashboard/account/onboarding-form'

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="relative overflow-hidden">
      {/* blurred background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
        {/* simulated blurred content elements */}
        <div className="absolute left-8 top-8 h-16 w-16 rounded-full bg-orange-200 opacity-60 blur-md" />
        <div className="absolute right-24 top-12 h-4 w-32 rounded bg-gray-400 opacity-40 blur-sm" />
        <div className="absolute left-16 top-32 h-4 w-24 rounded bg-gray-500 opacity-30 blur-sm" />
        <div className="absolute right-32 top-48 h-20 w-20 rounded-full bg-orange-300 opacity-50 blur-lg" />
        <div className="absolute bottom-32 left-12 h-6 w-28 rounded bg-gray-400 opacity-35 blur-sm" />
        <div className="absolute bottom-16 right-16 h-12 w-12 rounded-full bg-red-200 opacity-45 blur-md" />
        <div className="absolute bottom-24 left-32 h-3 w-16 rounded bg-green-300 opacity-40 blur-sm" />
      </div>

      {/* card */}
      <div className="relative flex min-h-svh items-center justify-center p-6">
        <OnboardingForm />
      </div>
    </div>
  )
}
