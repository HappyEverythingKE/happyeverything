import { Link } from '@tanstack/react-router'

import { Gift, Heart, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function EmptyListsState({ description }: { description: string }) {
  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center p-8">
      <h1 className="mt-8 font-sans text-xl font-normal">{description}</h1>

      {/* supporting text */}
      <div className="mt-12 max-w-lg text-center">
        <p className="mb-4 text-sm leading-relaxed text-gray-700">
          Create wish lists for any occasion - birthdays, holidays, weddings, or
          just because. Share them with loved ones so they know exactly what
          would make you smile.
        </p>

        <div className="mb-8 flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Gift className="h-3 w-3" />
            <span>Easy to share</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-3 w-3" />
            <span>Always updated</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Surprise-proof</span>
          </div>
        </div>

        <Button asChild>
          <Link to="/signup">Create your first wish list</Link>
        </Button>
      </div>
    </div>
  )
}
